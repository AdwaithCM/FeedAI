const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this._id = data._id;
        this.email = data.email;
        this.password = data.password;
        this.name = data.name;
        this.type = data.type; // 'donor' or 'recipient'
        this.location = data.location;
        this.points = data.points || 0;
        this.badges = data.badges || [];
        this.createdAt = data.createdAt || new Date();
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}

module.exports = User;
