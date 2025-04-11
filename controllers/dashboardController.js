const prisma = require("../config/database");

exports.getDashboard = async (req, res) => {
  try {
    const files = await prisma.file_fu.findMany({
      where: { userId: req.user.id },
    });

    const folders = await prisma.folder_fu.findMany({
      where: { userId: req.user.id },
    });

    res.render("dashboard", {
      user: req.user,
      files,
      folders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: err });
  }
};
