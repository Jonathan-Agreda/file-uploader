const prisma = require("../config/database");
const path = require("path");
const fs = require("fs");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .render("error", { error: "No se subió ningún archivo" });
    }

    const folderId = req.query.folderId ? parseInt(req.query.folderId) : null;

    // Construir la ruta del archivo
    const folder = folderId
      ? await prisma.folder_fu.findUnique({ where: { id: folderId } })
      : null;

    const folderName = folder
      ? folder.name.replace(/[^a-zA-Z0-9-_]/g, "_")
      : null;

    const uploadPath = folderName
      ? `/uploads/${folderName}/${req.file.filename}`
      : `/uploads/${req.file.filename}`;

    // Crear el registro del archivo en la base de datos
    const file = await prisma.file_fu.create({
      data: {
        name: req.file.originalname,
        url: uploadPath,
        userId: req.user.id,
        folderId: folderId,
      },
    });

    res.redirect(folderId ? `/folders/${folderId}` : "/dashboard");
  } catch (err) {
    console.error(err);

    // Eliminar el archivo subido si hubo un error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).render("error", { error: err });
  }
};

exports.getFileDetails = async (req, res) => {
  try {
    const file = await prisma.file_fu.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      return res
        .status(404)
        .render("error", { error: "Archivo no encontrado" });
    }

    const filePath = path.join(__dirname, "../public", file.url);
    const stats = fs.statSync(filePath);

    res.render("file/details", {
      file: {
        ...file,
        size: (stats.size / 1024).toFixed(2), // KB
        uploadDate: file.createdAt.toLocaleDateString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: err });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await prisma.file_fu.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      return res
        .status(404)
        .render("error", { error: "Archivo no encontrado" });
    }

    const filePath = path.join(__dirname, "../public", file.url);

    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .render("error", { error: "El archivo no existe en el servidor" });
    }

    res.download(filePath, file.name);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: err });
  }
};
