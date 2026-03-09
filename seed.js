require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Equipment = require('./models/Equipment');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Create admin
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
        await User.create({ name: 'Administrator', username: 'admin', password: 'admin123', role: 'admin' });
        console.log('✅ Admin created: admin / admin123');
    } else {
        console.log('ℹ️  Admin already exists.');
    }

    // Create sample staff
    const existingStaff = await User.findOne({ username: 'staff1' });
    if (!existingStaff) {
        await User.create({ name: 'Maria Santos', username: 'staff1', password: 'staff123', role: 'staff' });
        console.log('✅ Staff created: staff1 / staff123');
    }

    // Create sample equipment
    const equipCount = await Equipment.countDocuments();
    if (equipCount === 0) {
        const items = [
            { name: 'Epson Projector EB-X41', category: 'Projector', description: 'Standard classroom projector, 3600 lumens', quantity: 5, availableQty: 5, condition: 'Good' },
            { name: 'Lenovo ThinkPad Laptop', category: 'Laptop', description: 'Core i5, 8GB RAM, 256GB SSD', quantity: 10, availableQty: 10, condition: 'Good' },
            { name: 'Sony Handycam', category: 'Camera', description: 'Full HD video camera', quantity: 3, availableQty: 3, condition: 'Good' },
            { name: 'Wireless Microphone Set', category: 'Audio', description: 'UHF wireless microphone, 2 mics + receiver', quantity: 4, availableQty: 4, condition: 'Good' },
            { name: 'HDMI Cable (3m)', category: 'Accessory', description: 'High-speed HDMI cable', quantity: 15, availableQty: 15, condition: 'Good' },
            { name: 'Portable Bluetooth Speaker', category: 'Audio', description: 'JBL Flip 5 portable speaker', quantity: 6, availableQty: 6, condition: 'Good' },
            { name: 'VGA to HDMI Adapter', category: 'Accessory', description: 'VGA to HDMI converter', quantity: 8, availableQty: 8, condition: 'Fair' },
            { name: 'Digital Camera (DSLR)', category: 'Camera', description: 'Canon EOS 1500D with kit lens', quantity: 2, availableQty: 2, condition: 'Good' },
        ];
        await Equipment.insertMany(items);
        console.log('✅ Sample equipment added:', items.length, 'items');
    } else {
        console.log('ℹ️  Equipment already seeded.');
    }

    console.log('\n🎉 Seeding complete! Run: node app.js');
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
