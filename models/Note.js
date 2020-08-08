var mongoose = require("mongoose");

//Save the reference to the Schema constructor
var Schema = mongoose.Schema;

//this is the schema constructor, creating a new NoteSchema object
var NoteSchema = new Schema({
    body: String
});

//This will create our model from the above schema, using mongoose's model
var Note = mongoose.model("Note", NoteSchema);


//this exports the Note model
module.exports = Note;