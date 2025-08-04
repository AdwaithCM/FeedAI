const { getDB } = require('../config/db');
const Match = require('../models/Match');

class MatchingService {
    static async findOptimalMatch(donation) {
        const db = getDB();
        
        try {
            // Get all active recipients
            const recipients = await db.get('recipients');
            
            // Calculate match scores based on multiple criteria
            const matches = recipients.map(recipient => {
                const score = this.calculateMatchScore(donation, recipient);
                return { recipient, score };
            });
            
            // Sort by score and get the best match
            matches.sort((a, b) => b.score - a.score);
            const bestMatch = matches[0];
            
            if (bestMatch && bestMatch.score > 0.5) { // Threshold for acceptable matches
                // Create and save the match
                const matchData = {
                    donationId: donation._id,
                    donorId: donation.donorId,
                    recipientId: bestMatch.recipient._id,
                    matchScore: bestMatch.score,
                    routeOptimization: this.calculateOptimalRoute(donation, bestMatch.recipient),
                    estimatedDeliveryTime: this.estimateDeliveryTime(donation, bestMatch.recipient)
                };
                
                const match = new Match(matchData);
                await db.insert(match);
                return match;
            }
            
            return null;
        } catch (error) {
            console.error('Matching error:', error);
            throw error;
        }
    }
    
    static calculateMatchScore(donation, recipient) {
        let score = 0;
        
        // Location proximity (using simple distance calculation)
        const distance = this.calculateDistance(
            donation.location.coordinates,
            recipient.location.coordinates
        );
        score += (1 - Math.min(distance / 10, 1)) * 0.4; // 40% weight for distance
        
        // Food type preference match
        if (recipient.foodPreferences.includes(donation.foodType)) {
            score += 0.3; // 30% weight for food type match
        }
        
        // Capacity check
        if (recipient.currentCapacity >= donation.quantity) {
            score += 0.2; // 20% weight for capacity
        }
        
        // Time window compatibility
        const timeCompatibility = this.checkTimeCompatibility(
            donation.pickupTime,
            recipient.availableHours
        );
        score += timeCompatibility * 0.1; // 10% weight for time compatibility
        
        return score;
    }
    
    static calculateDistance(coord1, coord2) {
        // Simple Euclidean distance calculation
        const dx = coord1[0] - coord2[0];
        const dy = coord1[1] - coord2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static calculateOptimalRoute(donation, recipient) {
        // Simplified route optimization
        return {
            pickup: donation.location,
            delivery: recipient.location,
            estimatedDistance: this.calculateDistance(
                donation.location.coordinates,
                recipient.location.coordinates
            )
        };
    }
    
    static estimateDeliveryTime(donation, recipient) {
        // Simple delivery time estimation
        const distance = this.calculateDistance(
            donation.location.coordinates,
            recipient.location.coordinates
        );
        const averageSpeed = 30; // km/h
        const estimatedHours = distance / averageSpeed;
        
        const pickupTime = new Date(donation.pickupTime);
        return new Date(pickupTime.getTime() + estimatedHours * 60 * 60 * 1000);
    }
    
    static checkTimeCompatibility(pickupTime, availableHours) {
        // Simple time window compatibility check
        const pickup = new Date(pickupTime);
        const hour = pickup.getHours();
        
        if (availableHours.some(window => 
            hour >= window.start && hour <= window.end)) {
            return 1;
        }
        return 0;
    }
}

module.exports = MatchingService;
