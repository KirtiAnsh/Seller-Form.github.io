const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure 'uploads' folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

// Handle form submission
app.post("/upload", upload.array("product-images", 5), (req, res) => {
    const formData = req.body;
    const images = req.files.map(file => file.filename);

    const productData = {
        sellerName: formData["seller-name"],
        companyName: formData["company-name"],
        productName: formData["product-name"],
        quantity: formData["quantity"],
        price: formData["price"],
        category: formData["category"],
        description: formData["description"],
        sku: formData["sku"],
        tags: formData["tags"],
        images: images
    };

    // Save data to local JSON file
    fs.readFile("uploads/data.json", (err, data) => {
        let jsonData = [];
        if (!err && data.length > 0) {
            jsonData = JSON.parse(data);
        }
        jsonData.push(productData);
        fs.writeFile("uploads/data.json", JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error("Error saving data:", err);
                return res.status(500).json({ message: "Failed to save data" });
            }
            res.json({ message: "Product uploaded successfully", data: productData });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
