const { getDb } = require('../config/db');

async function getStaffProfile (req, res) {
    try {
        const db = getDb();
        const collection = db.collection('staff_details');
        const uniqueId = req.params.unique_id;

        const facultyData = await collection.findOne({ unique_id: uniqueId });

        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }
        const convertedData = {
            "_id": facultyData["unique_id"], 
            "Name": facultyData["Name"],
            "Surname": facultyData["Initial or Surname"],
            "Designation": facultyData["Designation"],
            "Joined_in": facultyData["Joined in"],
            "Department_Name": facultyData["Department Name"],
            "Mail_ID": facultyData["Mail ID"],
            // "Photo": `/static/images/profile_photos/${facultyData["unique_id"]}.jpg`,
            "Photo": facultyData.Photo,
            "Google_Scholar_Profile": facultyData["Google Scholar Profile"],
            "Research_Gate": facultyData["Research Gate"],
            "Orchid_Profile": facultyData["Orchid Profile"] || null,
            "Publon_Profile": facultyData["Publon Profile"] || null,
            "Scopus_Author_Profile": facultyData["Scopus Author Profile"],
            "LinkedIn_Profile": facultyData["LinkedIn Profile"],
            "Professional_Membership": facultyData["Professional Membership"] || null,
            "Sponsored_Projects": facultyData["Sponsored Projects"],
            "Patent_Granted": facultyData["Patent Granted"],
            "Patent_Published": facultyData["Patent Published"],
            "Patent_Filed": facultyData["Patent Filed"] || null,
            "Journal_Publications": facultyData["Journal Publications"],
            "Conference_Publications": facultyData["Conference Publications"],
            "Book_Chapter_Published": facultyData["Book Chapter Published"],
            "Guest_Lectures_Delivered": facultyData["Guest Lectures Delivered"],
            "Guest_Lectures_Attended": facultyData["Guest Lectures Attended"] || null,
            "Guest_Lectures_Organized": facultyData["Guest Lectures Organized"],
            "PHD_Produced": facultyData["PHD Produced"] || null,
            "PHD_Pursuing": facultyData["PHD Pursuing"] || null,
            "Upload_Your_Excel_File_Here": facultyData["Upload Your Excel File Here"],
            "unique_id": facultyData["unique_id"],
            "EDUCATIONAL_QUALIFICATION": facultyData["EDUCATIONAL_QUALIFICATION"].map(qual => ({
                "DEGREE": qual["DEGREE"],
                "BRANCH": qual["BRANCH"],
                "INSTITUTE": qual["INSTITUTE"],
                "YEAR": qual["YEAR"]
            })),
            "EXPERIENCE": facultyData["EXPERIENCE"]
                .filter(exp => exp.DURATION !== "From")
                .map(exp => ({
                    "From": exp["DURATION"] === "TOTAL" ? null : exp["DURATION"],
                    "TO": exp["Unnamed:_1"] === "TO" ? null : exp["Unnamed:_1"],
                    "YEARS": exp["EXPERIENCE"] === "NO.OF.YEARS" || exp["EXPERIENCE"] === "-" ? null : exp["EXPERIENCE"],
                    "MONTHS": exp["Unnamed:_3"] === "NO.OF MONTHS" || exp["Unnamed:_3"] === "-" ? null : exp["Unnamed:_3"],
                    "DESIGNATION": exp["DESIGNATION"] || null,
                    "INSTITUTION": exp["INSTITUTION"] || null
                })),
            "CONFERENCE_PUBLICATIONS": facultyData["CONFERENCE_PUBLICATIONS"].map(pub => ({
                "AUTHORS": pub["AUTHORS"],
                "PAPER_TITLE": pub["PAPER_TITLE"],
                "CONFERENCE_NAME": pub["CONFERENCE_NAME"],
                "ORGANIZED_BY": pub["ORGANIZED_BY"],
                "book_number": pub["book_number"],
                "MONTH_&YEAR": pub["MONTH&_YEAR"]
            })),
            "BOOK_PUBLICATIONS": facultyData["BOOK_PUBLICATIONS"].map(pub => ({
                "AUTHOR": pub["AUTHOR"],
                "BOOK_NAME,_EDITION": pub["BOOK_NAME,_EDITION"],
                "PUBLISHER": pub["PUBLISHER"],
                "ISBN_/ISSN_NO": pub["ISBN/_ISSN_NO"],
                "MONTH_&YEAR": pub["MONTH&_YEAR"],
                "BOOK": pub["BOOK"]
            })),
            "PATENTS": facultyData["PATENTS"] || [],
            "PROJECTS": facultyData["PROJECTS"].map(project => ({
                "TITLE": project["TITLE"],
                "SPONSORING_AGENCY": project["SPONSORING_AGENCY"],
                "AMOUNT": project["AMOUNT"],
                "YEAR_OF_SANCTION": project["YEAR_OF_SANCTION"],
                "DURATION": project["DURATION"],
                "RESPONSIBILITY": project["RESPONSIBILITY"],
                "STATUS": project["STATUS"]
            })),
            "JOURNAL_PUBLICATIONS": facultyData["JOURNAL_PUBLICATIONS"].map(pub => ({
                "AUTHORS": pub["AUTHORS"],
                "PAPER_TITLE": pub["PAPER_TITLE"],
                "JOURNAL_NAME": pub["JOURNAL_NAME"],
                "DOI_NUMBER": pub["DOI_NUMBER"],
                "PAGE_NO": pub["PAGE_NO"],
                "VOL_NO": pub["VOL_NO"],
                "MONTH_&YEAR": pub["MONTH&_YEAR"],
                "INDEXED": pub["INDEXED"]
            })),
            "RESEARCH_SCHOLARS": facultyData["RESEARCH_SCHOLARS"] || []
        };
        res.json(convertedData);
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.status(500).json({ message: 'Error fetching faculty data' });
    }
}

module.exports = { getStaffProfile }