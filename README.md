# PicFlex Studio

> **A free, privacy-first browser-based image and video editing & compression studio.**

PicFlex Studio lets you **edit, enhance, resize, crop, compress, and export images and videos directly in your browser**.

No account. No watermarks. No server-side media uploads.

All core media processing happens locally on the user's device.

---

## ✨ Features

### 🖼️ Image Editor

PicFlex provides a complete image editing workspace with real-time preview.

#### Resize & Scaling

- Custom width and height
- Quick scaling from **10% to 200%**
- Dimension presets
- Fit
- Fill
- Stretch

#### Preset Dimensions

Built-in presets for common platforms:

- Instagram Square — `1080 × 1080`
- Instagram Story — `1080 × 1920`
- YouTube Thumbnail — `1280 × 720`
- Facebook Cover — `820 × 312`
- Twitter Header — `1500 × 500`
- Full HD — `1920 × 1080`

#### Crop

- Free-form cropping
- `1:1`
- `16:9`
- `4:3`
- `9:16`
- `3:2`
- `2:3`
- Interactive crop workspace
- Drag/resize crop handles
- Reset crop bounding box
- Finalize crop

#### Image Enhancements

Fine-grained controls for:

- Brightness
- Contrast
- Saturation
- Exposure
- Blur
- Grayscale
- Sepia
- Hue rotation
- Color inversion
- Sharpening

### ✨ Auto Enhance

A one-click **Auto Enhance** option automatically applies a combination of enhancement parameters to improve the image.

The editor also provides individual controls for manually tuning the result.

### 🔄 Transformations

- Rotate clockwise
- Rotate counter-clockwise
- Horizontal flip
- Vertical flip
- Fit/fill preview modes
- Original vs edited comparison

### 🖼️ Frames & Borders

Multiple frame styles are available:

- Modern Border
- Retro Polaroid
- Wood Gallery
- Neon Cyberpunk

Frame customization includes:

- Frame width
- Border radius
- Frame color
- Polaroid text
- Neon glow size

Available frame colors include:

- White
- Dark
- Grey
- Gold
- Purple
- Cyan
- Lime

### 🗜️ Image Compression

Control the output file size with an adjustable compression slider.

Features:

- Compression level control
- Estimated output file size
- Quality/file-size balancing
- JPEG export
- WebP export

### 📥 Image Export

Export edited images directly from the browser as:

- **JPEG**
- **WebP**

No server upload is required.

---

# 🎬 Video Editor

PicFlex also includes a browser-based video editing workspace.

> **Video editing is currently marked as Beta in the application.**

### 📤 Video Input

Supports:

- MP4
- WebM
- MOV

Users can upload a video directly from their device and preview it in the browser.

### ✂️ Video Trimming

Trim videos using:

- Start time slider
- End time slider
- Precise start/end time inputs
- Interactive video timeline
- Real-time playback preview

### 🎨 Video Filters

Apply real-time filters including:

- Brightness
- Contrast
- Saturation
- Hue rotation
- Blur
- Grayscale
- Sepia

Filters can be individually reset or completely reset.

### 🗜️ Video Compression

Adjust the compression level to balance:

- Video quality
- Output file size
- Bitrate

The application also provides an **estimated output file size** before export.

### 📦 Video Export

Export processed videos as:

- **MP4 (H.264)**
- **WebM (VP9)**

WebM can use native browser recording, while MP4 conversion uses **FFmpeg WebAssembly** when required.

The application displays export progress while processing.

---

# 🔒 Privacy First

PicFlex is designed around local processing.

```text
Your Device
     │
     ├── Image
     │      ↓
     │   Canvas Processing
     │      ↓
     │   Edited Image
     │
     └── Video
            ↓
       Canvas + MediaRecorder
            ↓
        FFmpeg WASM
            ↓
       Edited Video
```

Your media files are processed in the browser rather than being uploaded to a backend server for editing.

This means your images and videos can remain on your device during the editing workflow.

---

# 📧 Contact System

PicFlex includes a dedicated **Contact Us** page powered by **EmailJS**.

Users can submit:

- Bug reports
- Business inquiries
- Feature requests
- Feedback
- General inquiries

The form includes:

- Name validation
- Email validation
- Message validation
- Submission state
- Loading state
- Error handling
- Success confirmation

EmailJS credentials are supplied through environment variables.

---

# 🛠️ Tech Stack

### Frontend

- **React 19**
- **JavaScript**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Lucide React**

### Media Processing

- **HTML Canvas API**
- **MediaRecorder API**
- **FFmpeg WebAssembly**
- **Browser File APIs**

### Communication

- **EmailJS**

### Development Tools

- ESLint
- Vite development server

---

# 🧠 Architecture

PicFlex follows a client-side React architecture.

```text
                    PicFlex Studio
                         │
             ┌───────────┴───────────┐
             │                       │
        Image Editor             Video Editor
             │                       │
       React State              React State
             │                       │
       Canvas API          MediaRecorder API
             │                       │
       Image Filters          Video Filters
             │                       │
       Resize / Crop          Trim / Compress
             │                       │
             └───────────┬───────────┘
                         │
                    Export File
                         │
                    User Device
```

The application uses React state to control editing parameters while Canvas and browser media APIs handle the actual processing.

---

# 📁 Project Structure

```text
PicFlex/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── Navbar.jsx
│   │   └── ScrollLink.jsx
│   │
│   ├── pages/
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   ├── Image.jsx
│   │   └── Video.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── AGENTS.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/PicFlex.git
```

## 2. Enter the project

```bash
cd PicFlex
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create a `.env` file based on `.env.example`.

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

These variables are required for the Contact Us email functionality.

## 5. Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

---

# 📜 Available Scripts

### Development

```bash
npm run dev
```

Starts the Vite development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally.

### Lint

```bash
npm run lint
```

Runs ESLint across the project.

---

# 🧩 Important Technical Concepts

PicFlex demonstrates several useful frontend and browser technologies.

### Canvas API

Used for image manipulation and rendering operations such as:

- Cropping
- Resizing
- Rotation
- Flipping
- Filters
- Sharpening
- Frames
- Exporting

### MediaRecorder API

Used to capture processed video frames and generate browser-compatible video output.

### FFmpeg WebAssembly

Used for browser-side MP4 conversion when native browser recording does not provide the required MP4 output.

The FFmpeg core is loaded only when required for MP4 export.

### Object URLs

Browser-generated object URLs are used to preview locally selected video files without uploading them to a server.

### React State

Editing parameters are maintained through React state, allowing the preview to update as users modify editing controls.

### HashRouter

The application uses React Router's `HashRouter` for client-side navigation.

Available routes include:

```text
/
 /image
 /video
 /contact
```

---

# 🎯 Project Goals

PicFlex was built to explore how a browser can be used as a lightweight media-processing environment.

The project focuses on:

- React application architecture
- Client-side image processing
- Browser-based video processing
- Canvas manipulation
- MediaRecorder
- FFmpeg WebAssembly
- File handling
- Real-time previews
- Compression algorithms and quality trade-offs
- Responsive UI design
- Privacy-focused application design

---

# 🚀 Future Improvements

Potential improvements include:

- Full timeline-based video editing
- More advanced video transitions
- Multiple video tracks
- Audio editing
- Video resolution controls
- Advanced image adjustment presets
- Undo/redo history
- Batch image processing
- Batch compression
- Additional export formats
- More advanced drag-and-drop interactions
- Mobile-specific editing controls

---

# 📌 Current Limitations

- Video editing is currently labeled **Beta**.
- MP4 export may require downloading the FFmpeg WebAssembly core on first use.
- Processing speed depends on the user's device and browser.
- Large media files can require significant browser memory.
- Browser support for video codecs can vary between browsers.

---

# 👨‍💻 Author

**Shiv Kumar**

Computer Science Engineering Student

---

## ⭐ PicFlex Studio

A lightweight alternative for everyday media processing — **edit locally, keep your files private, and download the result.**