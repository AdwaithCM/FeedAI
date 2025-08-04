class Match {
    constructor(data) {
        this._id = data._id;
        this.donationId = data.donationId;
        this.donorId = data.donorId;
        this.recipientId = data.recipientId;
        this.status = data.status || 'pending'; // pending, accepted, completed
        this.matchScore = data.matchScore;
        this.routeOptimization = data.routeOptimization;
        this.estimatedDeliveryTime = data.estimatedDeliveryTime;
        this.createdAt = data.createdAt || new Date();
    }
}

module.exports = Match;
