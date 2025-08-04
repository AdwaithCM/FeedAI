const { getDB } = require('../config/db');

class GamificationService {
    static async updateDonorPoints(donorId, donation) {
        const db = getDB();
        
        try {
            // Calculate points based on donation quantity and type
            const points = this.calculatePoints(donation);
            
            // Update donor's points
            const donor = await db.get(donorId);
            donor.points += points;
            
            // Check and award badges
            const newBadges = this.checkBadges(donor);
            donor.badges = [...new Set([...donor.badges, ...newBadges])];
            
            // Save updated donor
            await db.insert(donor);
            
            return {
                points: donor.points,
                newPoints: points,
                badges: donor.badges,
                newBadges
            };
        } catch (error) {
            console.error('Gamification error:', error);
            throw error;
        }
    }
    
    static calculatePoints(donation) {
        let points = 0;
        
        // Base points for donation
        points += 10;
        
        // Points based on quantity
        points += Math.floor(donation.quantity * 0.5);
        
        // Bonus points for perishable items (they're harder to coordinate)
        if (donation.perishable) {
            points += 5;
        }
        
        return points;
    }
    
    static checkBadges(donor) {
        const newBadges = [];
        
        // First Donation Badge
        if (donor.points === 10) {
            newBadges.push('First-Time Hero');
        }
        
        // Donation Milestone Badges
        if (donor.points >= 100 && !donor.badges.includes('Zero-Waste Warrior')) {
            newBadges.push('Zero-Waste Warrior');
        }
        
        if (donor.points >= 500 && !donor.badges.includes('Food Hero')) {
            newBadges.push('Food Hero');
        }
        
        if (donor.points >= 1000 && !donor.badges.includes('Hunger Fighter')) {
            newBadges.push('Hunger Fighter');
        }
        
        return newBadges;
    }
    
    static async getLeaderboard() {
        const db = getDB();
        
        try {
            const donors = await db.query({
                selector: {
                    type: 'donor'
                },
                sort: [{ points: 'desc' }],
                limit: 10
            });
            
            return donors.map(donor => ({
                name: donor.name,
                points: donor.points,
                badges: donor.badges
            }));
        } catch (error) {
            console.error('Leaderboard error:', error);
            throw error;
        }
    }
}

module.exports = GamificationService;
