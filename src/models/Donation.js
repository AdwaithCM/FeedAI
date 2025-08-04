class Donation {
    constructor(data) {
        this._id = data._id;
        this.donorId = data.donorId;
        this.foodType = data.foodType;
        this.quantity = data.quantity;
        this.unit = data.unit;
        this.perishable = data.perishable;
        this.expiryDate = data.expiryDate;
        this.pickupTime = data.pickupTime;
        this.status = data.status || 'available'; // available, matched, completed
        this.location = data.location;
        this.createdAt = data.createdAt || new Date();
    }
}

module.exports = Donation;
