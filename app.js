const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use(express.json());

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to generate PDF certificate
app.post('/generate-certificate', (req, res) => {
    const { username, quizScore } = req.body;

    // Check if the user is eligible for the certificate
    if (!username || quizScore < 70) {
        return res.status(400).json({ message: 'User not eligible for certificate' });
    }

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

    // Define the path for the PDF file
    const fileName = `${username}_certificate.pdf`;
    const filePath = path.join(__dirname, fileName);

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filePath));

    // Add the certificate background
    const bgPath = path.join(__dirname, 'public', 'certificate-bg.jpg');
    if (fs.existsSync(bgPath)) {
        doc.image(bgPath, 0, 0, { width: 841 });
    } else {
        console.error("Background image not found:", bgPath);
    }

    // Add text to the certificate
    doc.fontSize(38)
        .fillColor('black')
        .font('Helvetica-BoldOblique')
        .text('Certificate of Achievement', 110, 100, { align: 'center' })

        .fontSize(30)
        .text(`This certifies that`, 100, 160, { align: 'center' })

        .fontSize(39)
        .text(username, 100, 230, { align: 'center' })

        .fontSize(28)
        .text(`has successfully completed the quiz`, 120, 300, { align: 'center' })

        .fontSize(28)
        .text(`with a score of ${quizScore}%`, 100, 350, { align: 'center' })

        .fontSize(23)
        .text(`Awarded on ${formattedDate} at ${formattedTime}`, 100, 420, { align: 'center' });

    // Finalize the PDF and end the stream
    doc.end();

    // Send the PDF link in response
    res.json({ message: 'Certificate generated', link: `/download/${fileName}` });
});

// Endpoint to download the generated certificate
app.get('/download/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                console.error(err);
                res.status(404).send('Certificate not found');
            }
        });
    } else {
        res.status(404).send('Certificate not found');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
