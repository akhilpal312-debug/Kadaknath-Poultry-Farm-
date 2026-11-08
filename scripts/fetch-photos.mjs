/**
 * Downloads the site's photographs from Wikimedia Commons into public/images
 * before the production build runs.
 *
 * Why: the photos are CC BY-SA 4.0 reference images of the Kadaknath breed
 * (credited in the footer, not photographs of this farm). Fetching them at
 * build time keeps them self-hosted on the site's own domain without storing
 * large binaries in the repository.
 *
 * Existing files are never overwritten, so once the farm supplies its own
 * photographs in public/images/ they simply take over. Delete a file here if
 * you want it re-downloaded.
 *
 * A failed download never breaks the build — it only logs a warning.
 */
import { existsSync, mkdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { get } from 'node:https'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'images')
const MIN_BYTES = 10_000

/** destination file → Wikimedia Commons file name (and requested width in px) */
const PHOTOS = [
  { file: 'hero-pair.jpg', source: 'Kadaknath pair.jpg', width: 1200 },
  { file: 'pair-wide.jpg', source: 'முட்டை வைத்திருக்கும் கடக்நாத் கோழிகள்.jpg', width: 1000 },
  { file: 'rooster-head.jpg', source: 'Kadaknath eye.jpg', width: 800 },
  { file: 'hen-head.jpg', source: 'கடக்நாத் சேவலின் முகம்.jpg', width: 1000 },
  { file: 'rooster-portrait.jpg', source: 'கடக்நாத் சேவல் முக அமைப்பு.jpg', width: 1000 },
  { file: 'hen.jpg', source: 'கடக்நாத் பெட்டை கோழி.jpg', width: 1000 },
  { file: 'chicks.jpg', source: 'Broiler_chicks_Armenia_03.jpg', width: 1000 },
  { file: 'eggs.jpg', source: 'Eggs_in_basket_2020_G1.jpg', width: 1000 },
  { file: 'farm-film-poster.jpg', source: 'Kadaknath pair.jpg', width: 1000 },
]

function commonsUrl(name, width) {
  const encoded = encodeURIComponent(name).replace(/%20/g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${width}`
}

function download(url, destination, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const request = get(
      url,
      {
        headers: {
          'User-Agent': 'KadaknathPoultryFarmSite/1.0 (static site build; +https://kalaknath-farms.vercel.app)',
          Accept: 'image/jpeg,image/*;q=0.8',
        },
        timeout: 60_000,
      },
      (response) => {
        const { statusCode, headers } = response
        if (statusCode >= 300 && statusCode < 400 && headers.location && redirectsLeft > 0) {
          response.resume()
          resolve(download(new URL(headers.location, url).toString(), destination, redirectsLeft - 1))
          return
        }
        if (statusCode !== 200) {
          response.resume()
          reject(new Error(`HTTP ${statusCode}`))
          return
        }
        const type = headers['content-type'] || ''
        if (!type.startsWith('image/')) {
          response.resume()
          reject(new Error(`unexpected content-type ${type}`))
          return
        }
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          const buffer = Buffer.concat(chunks)
          if (buffer.length < MIN_BYTES) {
            reject(new Error(`file too small (${buffer.length} bytes)`))
            return
          }
          const temporary = `${destination}.part`
          try {
            writeFileSync(temporary, buffer)
            renameSync(temporary, destination)
            resolve(buffer.length)
          } catch (error) {
            reject(error)
          }
        })
      },
    )
    request.on('timeout', () => request.destroy(new Error('timed out')))
    request.on('error', reject)
  })
}

async function main() {
  mkdirSync(outDir, { recursive: true })
  const failures = []
  let downloaded = 0

  for (const photo of PHOTOS) {
    const destination = join(outDir, photo.file)
    const url = commonsUrl(photo.source, photo.width)

    if (existsSync(destination) && statSync(destination).size >= MIN_BYTES) {
      continue
    }

    try {
      const bytes = await download(url, destination)
      downloaded += 1
      console.log(`  ✓ ${photo.file} (${Math.round(bytes / 1024)} KB)`)
    } catch (error) {
      failures.push(`${photo.file} ← ${photo.source}: ${error.message}`)
      if (existsSync(`${destination}.part`)) unlinkSync(`${destination}.part`)
    }
  }

  if (downloaded > 0) console.log(`[photos] downloaded ${downloaded} image(s) from Wikimedia Commons`)
  if (failures.length > 0) {
    console.warn('[photos] some images could not be downloaded:')
    for (const failure of failures) console.warn(`  · ${failure}`)
    console.warn('[photos] the build continues; add those files to public/images/ manually.')
  }
}

main().catch((error) => {
  console.warn(`[photos] skipped: ${error.message}`)
})
