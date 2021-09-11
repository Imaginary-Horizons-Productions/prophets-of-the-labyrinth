module.exports = class Adventure {
    constructor(idInput, startIdInput, leaderInput) {
        this.id = idInput; // the id of the channel created for the adventure
        this.startMessageId = startIdInput;
        this.players = [leaderInput];
        this.accumulatedScore = 0;
    }
}
