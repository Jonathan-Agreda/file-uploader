const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../config/database");

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      let uploadPath = path.join(__dirname, "../public/uploads");

      const folderId = req.query.folderId;
      if (folderId) {
        // Obtén el nombre de la carpeta desde la base de datos
        const folder = await prisma.folder_fu.findUnique({
          where: { id: parseInt(folderId) },
        });

        if (folder) {
          const folderName = folder.name.replace(/[^a-zA-Z0-9-_]/g, "_"); // Sanitiza el nombre
          uploadPath = path.join(uploadPath, folderName);

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
        }
      }

      cb(null, uploadPath);
    } catch (err) {
      console.error("Error en el middleware de Multer:", err);
      cb(err); // Pasa el error a Multer
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Resto del código permanece igual...

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se permiten imágenes, PDFs y documentos de Office."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
