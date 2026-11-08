# Kadaknath Poultry Farm — website

A single-page site for the farm at Bhoshana, Shivli Road, Uttar Pradesh.

Built with React + Vite, Tailwind CSS 4, Framer Motion and Lucide icons.

```bash
npm install
npm run dev      # local preview
npm run build    # production build in dist/
```

## Things the owner must fill in

Everything editable lives in **`src/data/site.js`**:

| What | Where |
| --- | --- |
| Phone number | `farm.phone`, `farm.phoneHref` |
| WhatsApp number (digits only, country code first) | `farm.whatsapp` |
| E-mail | `farm.email` |
| Social profiles | `farm.socials` |
| Map location | `farm.mapQuery`, `farm.mapLink`, `farm.mapEmbed` |
| Products & prices | `products` |
| Gallery photos | `gallery` |
| Customer reviews | `testimonials` (currently marked samples) |

Phone: **+91 6393860760**. E-mail: **hello@kadaknathfarm.in** (still a placeholder — replace when verified).

## How the enquiry form works

It validates the fields, then opens WhatsApp with the message already written, so
the farm receives it like any other chat message. There is no server to maintain.

## Photography

Photos are reference images of the Kadaknath breed from Wikimedia Commons,
licensed CC BY-SA 4.0 and credited in the footer. Replace them with the farm's own
photos in `public/images/` (keep the same file names) when available.

The short film in `public/media/farm-film.mp4` is a photo montage built from the
same images.
