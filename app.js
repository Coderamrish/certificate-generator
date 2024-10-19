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
// Endpoint to generate PDF certificate
app.post('/generate-certificate', (req, res) => {
    const { username, quizScore } = req.body;

    // Check if the user is eligible for the certificate
    if (!username || quizScore < 70) {
        return res.status(400).json({ message: 'User not eligible for certificate' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

    // Define the path for the PDF file
    const fileName = `${username}_certificate.pdf`;
    const filePath = path.join(__dirname, fileName);

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filePath));

    // Add the certificate background
    doc.image(path.join(__dirname, 'public', 'certificate-bg.jpg'), 0, 0, { width: 841 }); // Adjust the width to fit A4 landscape

    // Add text to the certificate
    doc.fontSize(38)
    .fillColor('black')
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text('Certificate of Achievement', 110, 100, { align: 'center' })
    
    .fontSize(30)
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text(`This is to certifies that`, 100, 160, { align: 'center' })
    
    .fontSize(39)
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text(username, 100, 230, { align: 'center' })
    
    doc.fontSize(28)
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text(`has successfully completed the quiz`, 120, 300, { align: 'center' }) // Shifted to right (X = 120), slightly higher (Y = 300)
    
    .fontSize(28)
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text(`with a score of ${quizScore}%`, 100, 350, { align: 'center' }) // Reduced the gap slightly (Y = 350)
    
    .fontSize(18)
    .font('Helvetica-BoldOblique') // Bold and Italic font
    .text(`Awarded on ${currentDate} at ${currentTime}`, 100, 450, { align: 'center' });
    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    // Add date and time to the certificate
    doc.fontSize(23)
        .text(`Awarded on ${formattedDate} at ${formattedTime}`, 100, 320, { align: 'center' });

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
