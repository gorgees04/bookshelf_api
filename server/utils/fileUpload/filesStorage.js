const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { getStorage, getDownloadURL } = require("firebase-admin/storage");
const moment = require("moment");

// initialize firebase app as admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "bookshelf-app-a6b3c.appspot.com",
});

const uploadFile = async (pdfFile, folderPath, bookName) => {
  // pdfFile will come from request through multer
  try {
    const bucket = admin.storage().bucket();
    const imageBuffer = pdfFile.buffer;
    // add the date to the file name to ignore the dublicated names
    const date = new Date();
    const formatData = moment(date).format("D-M-YY,h:mm:ss-a");
    // folderPath is the name of the folder in firebase storage
    const fileName = folderPath + "/" + bookName + "_" + formatData;
    const file = bucket.file(fileName);
    // saving the file in database
    await file.save(imageBuffer, {
      contentType: pdfFile.mimetype,
    });

    // getting fileUrl
    const fileRef = getStorage()
      .bucket("bookshelf-app-a6b3c.appspot.com")
      .file(fileName);
    const downloadURL = await getDownloadURL(fileRef);

    return downloadURL;
  } catch (error) {
    throw Error(error.message);
  }
};

const deleteFile = (fileUrl) => {
  try {
    // grap file path from fileUrl
    const pathStartIndex = fileUrl.indexOf("/o/") + 3;
    const pathEndIndex = fileUrl.indexOf("?");
    const filePath = decodeURIComponent(
      fileUrl.substring(pathStartIndex, pathEndIndex)
    );

    // Create a reference to the file to delete
    const fileRef = admin.storage().bucket().file(filePath);
    fileRef
      .delete()
      .then(() => {
        console.log("File Deleted");
      })
      .catch(function (error) {
        throw Error(error.message);
      });
  } catch (error) {
    throw Error(error.message);
  }
};

module.exports = { uploadFile, deleteFile };
