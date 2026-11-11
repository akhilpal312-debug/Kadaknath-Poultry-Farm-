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
| Customer reviews | Submitted on the site itself — see “Customer reviews” below |

Phone: **+91 6393860760**. E-mail: **hello@kadaknathfarm.in** (still a placeholder — replace when verified).

## How the enquiry form works

It validates the fields, then opens WhatsApp with the message already written, so
the farm receives it like any other chat message. There is no server to maintain.

## Customer reviews

Visitors can rate the farm and write a short review on the site itself. Reviews are
stored in the project's Firestore database (collection `reviews`) using the web
config in `firebase-applet-config.json`, so every visitor sees the same list and a
new review appears as soon as it is submitted. There is no server of its own.

`firestore.rules` validates every field (2–60 character name and location, 1–5
stars, 10–500 character comment, one of the four categories) and only reviews with
`status: "published"` are readable. To remove a review, set its `status` to
`hidden` in the Firebase console or delete the document. The owner can also add an
`ownerReply`, which the site shows beneath the review.

If a submission cannot reach Firestore (offline, or the rules were changed), the
review is kept in the visitor's browser instead, shown with an “On this device”
tag, and the form offers a one-tap WhatsApp hand-off so the farm still receives it.

## Photography

Photos are reference images of the Kadaknath breed from Wikimedia Commons,
licensed CC BY-SA 4.0 and credited in the footer. They are not photographs of
this farm.

`npm run build` downloads them into `public/images/` first (see
`scripts/fetch-photos.mjs`), so the deployed site serves its own copies. To use
the farm's real photos, drop them in `public/images/` under the same file names
(`hero-pair.jpg`, `hen.jpg`, `chicks.jpg`, `eggs.jpg`, `rooster-portrait.jpg`,
`rooster-head.jpg`, `hen-head.jpg`, `pair-wide.jpg`, `farm-film-poster.jpg`) —
existing files are never overwritten by the download step.

The short film in `public/media/farm-film.mp4` is not part of the repository yet;
until it is added, the video dialog shows the poster image and a short notice.
