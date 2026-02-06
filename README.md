# 📚 Reading Partner
  
  **Your AI-Powered Reading and Research Assistant**
  
  [![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.3-orange?logo=firebase)](https://firebase.google.com/)
  [![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


---

##  Features

### 📄 Document Processing
- **PDF Rendering**: Native PDF viewing with full text selection
- **OCR Support**: Extract text from images (JPG, PNG) using Tesseract.js
- **Multi-format Support**: Handle both digital PDFs and scanned documents

###  Interactive Annotations
- **Smart Highlighting**: Select text and choose from 4 color options (yellow, green, pink, blue)
- **Contextual Notes**: Add notes to specific text selections with context preservation
- **Page Navigation**: Click highlights or notes to jump directly to their location

###  Cloud Sync
- **Firebase Integration**: All highlights and notes sync across devices
- **Real-time Updates**: Changes appear instantly
- **User Authentication**: Secure login with email/password

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn
- Firebase account (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jiminianX/reading-partner.git
   cd reading-partner
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Tech Stack

### Frontend
- **React 19.1** - UI framework
- **Vite 7.1** - Build tool (using Rolldown)
- **React Router 7.9** - Navigation

### Document Processing
- **PDF.js 5.4** - PDF rendering and text extraction
- **Tesseract.js 6.0** - OCR for images
- **Canvas API** - Document manipulation

### Backend & Database
- **Firebase Auth** - User authentication
- **Firestore** - Cloud database for highlights and notes
- **Firebase Hosting** - (Optional) Deployment

### Styling
- **CSS3** - Custom CSS with CSS variables
- **CSS Animations** - Smooth transitions and micro-interactions

---

## 🎯 Usage

### Uploading Documents

1. **Drag & Drop**: Simply drag a PDF or image file into the upload area
2. **Click to Browse**: Or click "Choose File" to select from your computer
3. **Wait for Processing**: 
   - PDFs render immediately
   - Images go through OCR text extraction (with progress indicator)

### Highlighting Text

1. **Select Text**: Click and drag to select text in the document
2. **Right-Click**: Open the context menu
3. **Choose Color**: Pick your highlight color
4. **View in Panel**: All highlights appear in the right panel

### Adding Notes

1. **Select Text**: Highlight the relevant passage
2. **Right-Click** → **Add Note**
3. **Write Your Note**: Enter your thoughts in the modal
4. **Save**: Note is saved with context
5. **Navigate**: Click notes in the right panel to jump to their location

### Managing Annotations

- **Delete Highlights**: Hover over highlight in right panel → Click "×" → Click again to confirm
- **Delete Notes**: Same process as highlights
- **Navigate**: Click any highlight or note to jump to that page

---

## 🚧 Roadmap

- [ ] AI-powered question generation
- [ ] Collaborative reading (share highlights)
- [ ] Export notes to Markdown/PDF
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Voice notes
- [ ] Flashcard creation from highlights
- [ ] Reading statistics and insights

---
## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow existing naming conventions
- Add comments for complex logic
- Test on both light and dark themes

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PDF.js** by Mozilla - PDF rendering
- **Tesseract.js** - OCR capabilities
- **Firebase** by Google - Backend infrastructure
- **React** team - Amazing framework
- **Vite/Rolldown** - Lightning-fast build tool

---

## 📧 Contact

**Project Link**: [https://github.com/yourusername/reading-partner](https://github.com/jiminianX/reading-partner)

**Issues**: [https://github.com/yourusername/reading-partner/issues](https://github.com/jiminianX/reading-partner/issues)

---

<div align="center">
  Made with 💜 for readers and learners everywhere
  
  ⭐ Star this repo if you find it helpful!
</div>
