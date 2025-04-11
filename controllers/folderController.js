const fs = require("fs");
const path = require("path");
const prisma = require("../config/database");

exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;

    // Crear el registro de la carpeta en la base de datos
    const folder = await prisma.folder_fu.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    // Crear la carpeta físicamente en el sistema de archivos
    const sanitizedFolderName = name.replace(/[^a-zA-Z0-9-_]/g, "_"); // Reemplaza caracteres no válidos
    const folderPath = path.join(
      __dirname,
      "../public/uploads",
      sanitizedFolderName
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: err });
  }
};

exports.getFolderContents = async (req, res) => {
  try {
    const folder = await prisma.folder_fu.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        files: true, // Incluye los archivos relacionados
      },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res
        .status(404)
        .render("error", { error: "Carpeta no encontrada" });
    }

    res.render("folder/contents", { folder });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: err });
  }
};
