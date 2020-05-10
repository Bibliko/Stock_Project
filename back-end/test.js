var storage = require('./firebase/firebaseStorage.js');
var migrationFolder = storage.ref('/system/migrations');

migrationFolder.list()
.then(function(result) {
    console.log(result);
    result.items.forEach(function(ref) {
        // And finally display them
        console.log(ref, '**************');
    });
    result.prefixes.forEach(function(ref) {
        console.log(ref, '**************');
    });
})
.catch(function(error) {
// Handle any errors
console.log(error);
});

function displayImage(imageRef) {
imageRef.getDownloadURL()
.then(function(url) {
    // TODO: Display the image on the UI
    console.log(url);
})
.catch(function(error) {
    // Handle any errors
    console.log(error);
});
}