const fs = require("fs");
const archiver = require("archiver");

const output = fs.createWriteStream("optbazar-backup.zip");
const archive = archiver("zip");

output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
        "Archiver has been finalized and the output file descriptor has closed.",
    );
});

archive.on("error", function (err) {
    throw err;
});

archive.pipe(output);

// Добавляем папки и файлы к архиву, исключая ненужные
archive.directory("src/", "src");
archive.directory("server/", "server");
archive.file("README.md", { name: "README.md" });
archive.file("DEPLOYMENT_GUIDE.md", { name: "DEPLOYMENT_GUIDE.md" });

archive.finalize();
