const RoomTemplate = require("../../Classes/RoomTemplate.js")

module.exports = new RoomTemplate()
	.setTypes("type") // enum: "Battle", "Merchant", "Event", "Rest Site", "Final Battle", "Artifact Guardian", "Forge"
	.setTitle("title")
	.setDescription("description")
	.setElement("embedColor");
