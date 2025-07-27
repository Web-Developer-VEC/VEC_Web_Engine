const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

// GET /about_us - Fetch all structured About Us data
async function getAboutUs(req, res) {
    const database = getDb();
    const aboutUsCollection = database.collection('about_us');

    try {
        const aboutUsDocuments = await aboutUsCollection
            .find({})
            .project({ _id: 0, section: 1, content: 1 })
            .toArray();

        if (aboutUsDocuments.length === 0) {
            return res.status(404).json({ message: 'No About Us data found' });
        }

        const structuredResponse = {};
        for (const document of aboutUsDocuments) {
            structuredResponse[document.section] = document.content;
        }

        return res.status(200).json({
            message: 'About Us data fetched successfully',
            data: structuredResponse
        });

    } catch (error) {
        console.error('Error fetching About Us content:', error);
        await logError(req, error, 'Error fetching About Us content', 500);
        return res.status(500).json({ error: 'Internal server error while fetching About Us content' });
    }
}

module.exports = { getAboutUs };