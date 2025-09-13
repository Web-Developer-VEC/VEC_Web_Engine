import React, { useState } from "react";
import "./Update_Form.css";
import { useEffect } from "react";
import {CopyPlus, FolderLock, Plus, Trash} from 'lucide-react'

const Update_Form = () => {
  const [photoPreview, setPhotoPreview] = useState('');
  // const [Facexp , setFacExp ] = useState("")
  // const [facultyType,setFacultyType]=useState("")
  const [facultyValidedEmail,setFacultyValidedEmail] = useState("")
  const [phdSelected,setPhdSelected]=useState(false)

  const todayDate = new Date().toISOString().split("T")[0]
  // console.log(todayDate);
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      handleGeneralInfoChange("photo", e.target.files[0])
    }
    
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
        alert("File size must be less than 10MB.");
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
    }
  };


  useEffect(()=>{
    console.log(photoPreview);
  },[photoPreview])

  // social media links 
  const [mediaLink , setMediaLink] = useState({
    scholarprefix : "https://scholar.google.com/",
    linkedinprefix : "https://www.linkedin.com/in/",
    orchidprefix : "https://orcid.org/",
    researchprefix : "https://www.researchgate.net/profile/" ,
    scopusprefix : "https://www.scopus.com/authid/detail.uri?authorId=",
    publonprefix : "https://publons.com/researcher/"})

    const handleLinkChange = (key,value) => {

      setMediaLink((prev)=>(
        {
          ...prev , [key]:value
        }
      ))
    }
  // console.log(mediaLink);
// console.log("bazz");
// const handleExpDate = (key, value) => {
//   setExpDate((prev) => ({
//     ...prev,
//     [key]: value
//   }));
// };

const [generalInformation, setGeneralInformation] = useState({
  category:"",
  title: "",
  name: "",
  last_name: "",
  surname: "",
  designation: "",
  joined_year: null,   
  department_name: "",
  mail_id: "",
  photo: "",           
});



// book , journal , patent , projects and research submit 

  const [bookPubCollections, setBookPubCollections] = useState([
    {
      bookPubAuthor: "",
      bookPubName: "",
      bookPublisher: "",
      bookPubISBN: "",
      bookPubyear: null,
      bookPubType: "",
      saved: false, 
    },
  ]);


const [patentCollections, setPatentCollections] = useState([
    {
      patentName: "",
      patentType: "",
      patentCountry: "",
      patentStatus: "",
      patentRecentAchieved: "",
      saved: false,
    },
  ]);

 const [projectCollections, setProjectCollections] = useState([
    {
      projectTitle: "",
      projectSponsoring: "",
      projectAmount: "",
      projectSanction: "",
      projectDuration: "",
      projectResponsibility: "",
      projectStatus: "",
      saved: false, // track if done is clicked
    },
  ]);

  const [journalCollections, setJournalCollections] = useState([
    {
      journalAuthor: "",
      journalTitle: "",
      journalName: "",
      journalDOINum: "",
      journalPageNum: null,
      journalVolumeAndIssue: null,
      journalMonthAndYear: null,
      journalIndexed: "",
      saved: false, // same as funded projects
    },
  ]);


 const [researchCollections, setResearchCollections] = useState([
    {
      researchName: "",
      researchTitle: "",
      researchCategory: "",
      researchStatus: "",
      researchDegreeAward: "",
      saved: false, // same as journal & funded projects
    },
  ]);

  const [experienceCollections, setExperienceCollections] = useState([
  {
    fromDate: null,
    toDate: null,
    experience:"",
    designation: "",
    institution: "",
  },
]);

 const [educationData, setEducationData] = useState([
    [{ degree: "", branch: "", institute: "", year: null, saved: false }],
    [{ degree: "", branch: "", institute: "", year: null, saved: false }],
    [{ degree: "", branch: "", institute: "", year: null, saved: false }]
  ]);

 const [conferenceCollections, setConferenceCollections] = useState([
    {
      conferenceAuthor: "",
      conferenceTitle: "",
      conferenceName: "",
      conferenceOrganizedBy: "",
      conferenceISBN: "",
      conferenceMonthAndYear: null,
      saved: false, 
    },
  ]);


  const handleBookPublication = (index, key, value) => {
    if(key==="bookPubyear" && value.length > 4){
     value= value.slice(0,4)
    }


  if( key==="bookPubyear" &&  value > todayDate && value.length === 4 ){
    value = todayDate
  }
    setBookPubCollections((prev) =>
      prev.map((book, i) =>
        i === index ? { ...book, [key]: value } : book
      )
    );
  };


const bookPubButtonAdd = () => {
    setBookPubCollections((prev) => [
      ...prev,
      {
        bookPubAuthor: "",
        bookPubName: "",
        bookPublisher: "",
        bookPubISBN: "",
        bookPubyear: "",
        bookPubType: "",
        saved: false,
      },
    ]);
  };

  const bookPubButtonCancel = (index) => {
    setBookPubCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // never delete the first/original
        if (i === index && !prev[i].saved) return false; // remove only if not saved
        return true;
      })
    );
  };

  const bookPubButtonDone = (index) => {
    const book = bookPubCollections[index];

    if (
      book.bookPubAuthor.trim() === "" ||
      book.bookPubName.trim() === "" ||
      book.bookPublisher.trim() === "" ||
      book.bookPubISBN.trim() === "" ||
      book.bookPubyear.trim() === "" ||
      book.bookPubType.trim() === ""
    ) {
      alert("Submit all the book publication details before submitting");
      return;
    }

    setBookPubCollections((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, saved: true } : b
      )
    );
  };

const handlePatents = (index, key, value) => {
    setPatentCollections((prev) =>
      prev.map((patent, i) =>
        i === index ? { ...patent, [key]: value } : patent
      )
    );
  };

  const patentButtonAdd = () => {
    setPatentCollections((prev) => [
      ...prev,
      {
        patentName: "",
        patentType: "",
        patentCountry: "",
        patentStatus: "",
        patentRecentAchieved: "",
        saved: false,
      },
    ]);
  };

  const patentButtonCancel = (index) => {
    setPatentCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // don’t delete original
        if (i === index && !prev[i].saved) return false; // remove only if not saved
        return true;
      })
    );
  };

  const patentButtonDone = (index) => {
    const patent = patentCollections[index];

    if (
      patent.patentName.trim() === "" ||
      patent.patentType.trim() === "" ||
      patent.patentCountry.trim() === "" ||
      patent.patentStatus.trim() === "" ||
      patent.patentRecentAchieved.trim() === ""
    ) {
      alert("Submit all the Patent details before submitting");
      return;
    }

    setPatentCollections((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, saved: true } : p
      )
    );
  };

const handleProjects = (index, key, value) => {
    setProjectCollections((prev) =>
      prev.map((project, i) =>
        i === index ? { ...project, [key]: value } : project
      )
    );
  };

  const projectButtonAdd = () => {
    setProjectCollections((prev) => [
      ...prev,
      {
        projectTitle: "",
        projectSponsoring: "",
        projectAmount: "",
        projectSanction: "",
        projectDuration: "",
        projectResponsibility: "",
        projectStatus: "",
        saved: false,
      },
    ]);
  };

  const projectButtonCancel = (index) => {
    setProjectCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // keep first one always
        if (i === index && !prev[i].saved) return false; // remove if not saved
        return true;
      })
    );
  };

  const projectButtonDone = (index) => {
    const project = projectCollections[index];

    if (
      project.projectTitle.trim() === "" ||
      project.projectSponsoring.trim() === "" ||
      project.projectAmount.trim() === "" ||
      project.projectSanction.trim() === "" ||
      project.projectDuration.trim() === "" ||
      project.projectResponsibility.trim() === "" ||
      project.projectStatus.trim() === ""
    ) {
      alert("Submit all the funded project details before submitting");
      return;
    }

    setProjectCollections((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, saved: true } : p
      )
    );
  };

   const handleJournal = (index, key, value) => {

    if(key==="journalMonthAndYear" && value.length > 4){
     value= value.slice(0,4)
    }
 
          if(key==="journalMonthAndYear" && value > todayDate && value.length === 4 ){
           value = null
         }
    setJournalCollections((prev) =>
      prev.map((journal, i) =>
        i === index ? { ...journal, [key]: value } : journal
      )
    );
  };

  const journalButtonAdd = () => {
    setJournalCollections((prev) => [
      ...prev,
      {
        journalAuthor: "",
        journalTitle: "",
        journalName: "",
        journalDOINum: "",
        journalPageNum: "",
        journalVolumeAndIssue: "",
        journalMonthAndYear: "",
        journalIndexed: "",
        saved: false,
      },
    ]);
  };

  const journalButtonCancel = (index) => {
    setJournalCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // keep first always
        if (i === index && !prev[i].saved) return false;
        return true;
      })
    );
  };

  const journalButtonDone = (index) => {
    const journal = journalCollections[index];

    if (
      journal.journalAuthor.trim() === "" ||
      journal.journalTitle.trim() === "" ||
      journal.journalName.trim() === "" ||
      journal.journalDOINum.trim() === "" ||
      journal.journalPageNum.trim() === "" ||
      journal.journalVolumeAndIssue.trim() === "" ||
      journal.journalMonthAndYear.trim() === "" ||
      journal.journalIndexed.trim() === ""
    ) {
      alert(" Please fill all the journal details before submitting");
      return;
    }

    setJournalCollections((prev) =>
      prev.map((j, i) =>
        i === index ? { ...j, saved: true } : j
      )
    );
  };

  const handleResearch = (index, key, value) => {
    setResearchCollections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const researchButtonAdd = () => {
    setResearchCollections((prev) => [
      ...prev,
      {
        researchName: "",
        researchTitle: "",
        researchCategory: "",
        researchStatus: "",
        researchDegreeAward: "",
        saved: false,
      },
    ]);
  };

  const researchButtonCancel = (index) => {
    setResearchCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // always keep first
        if (i === index && !prev[i].saved) return false;
        return true;
      })
    );
  };

  const researchButtonDone = (index) => {
    const research = researchCollections[index];

    if (
      research.researchName.trim() === "" ||
      research.researchTitle.trim() === "" ||
      research.researchCategory.trim() === "" ||
      research.researchStatus.trim() === "" ||
      research.researchDegreeAward.trim() === ""
    ) {
      alert("Please fill all the research details before submitting");
      return;
    }

    setResearchCollections((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, saved: true } : r
      )
    );
  };

const handleConference = (index, key, value) => {
  if (key === "conferenceMonthAndYear" && value.length > 4) {
    value = value.slice(0, 4);
  }

  if (key === "conferenceMonthAndYear" && value.length === 4 && value > todayDate) {
    value = null;
  }

  setConferenceCollections((prev) =>
    prev.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    )
  );
};
  const conferenceButtonAdd = () => {
    setConferenceCollections((prev) => [
      ...prev,
      {
        conferenceAuthor: "",
        conferenceTitle: "",
        conferenceName: "",
        conferenceOrganizedBy: "",
        conferenceISBN: "",
        conferenceMonthAndYear: "",
        saved: false,
      },
    ]);
  };

  const conferenceButtonCancel = (index) => {
    setConferenceCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // always keep first
        if (i === index && !prev[i].saved) return false;
        return true;
      })
    );
  };

  const conferenceButtonDone = (index) => {
    const conf = conferenceCollections[index];

    if (
      conf.conferenceAuthor.trim() === "" ||
      conf.conferenceTitle.trim() === "" ||
      conf.conferenceName.trim() === "" ||
      conf.conferenceOrganizedBy.trim() === "" ||
      conf.conferenceISBN.trim() === "" ||
      conf.conferenceMonthAndYear.trim() === ""
    ) {
      alert(" Please fill all the conference details before submitting");
      return;
    }

    setConferenceCollections((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, saved: true } : c
      )
    );
  };
  // update a single field
  const handleExperience = (index, key, value) => {
    setExperienceCollections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  // Add a new row (only if last one is saved)
  const experienceButtonAdd = () => {
    const lastExp = experienceCollections[experienceCollections.length - 1];
    if (!lastExp.saved) {
      alert("Please click Done before adding a new experience");
      return;
    }

    setExperienceCollections((prev) => [
      ...prev,
      {
        fromDate: "",
        toDate: "",
        designation: "",
        institution: "",
        saved: false,
      },
    ]);
  };

  // Mark a row as Done (validate before saving)
  const experienceButtonDone = (index) => {
    const exp = experienceCollections[index];

    if (
      !exp.fromDate.trim() ||
      !exp.toDate.trim() ||
      !exp.designation.trim() ||
      !exp.institution.trim()
    ) {
      alert("Please fill all experience details before submitting");
      return;
    }

    setExperienceCollections((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, saved: true } : item
      )
    );
  };

  // Cancel row (remove if not saved)
  const experienceButtonCancel = (index) => {
    setExperienceCollections((prev) =>
      prev.filter((_, i) => {
        if (i === 0) return true; // always keep first row
        if (i === index && !prev[i].saved) return false;
        return true;
      })
    );
  };

const handleInputChange = (degreeIndex, qualIndex, field, value) => {
  if (field==="year" && value.length > 4){
    value = value.slice(0,4)
  }
  if(field==="year" && value > todayDate && value.length === 4 ){
    value = todayDate
  }
    setEducationData((prev) => {
      const updated = [...prev];
      const degreeArr = [...updated[degreeIndex]];
      degreeArr[qualIndex] = { ...degreeArr[qualIndex], [field]: value };
      updated[degreeIndex] = degreeArr;
      return updated;
    });
  };

  // Add New: only if the LAST row for that degree is saved (exactly like Experience)
  const addQualification = (degreeIndex) => {
    setEducationData((prev) => {
      const updated = [...prev];
      const degreeArr = [...updated[degreeIndex]];
      const last = degreeArr[degreeArr.length - 1];

      if (!last?.saved) {
        alert(" Please click Done before adding a new qualification");
        return prev;
      }

      degreeArr.push({
        degree: "",
        branch: "",
        institute: "",
        year: "",
        saved: false,
      });

      updated[degreeIndex] = degreeArr;
      return updated;
    });
  };

  // Done: validate & lock this row
  const doneQualification = (degreeIndex, qualIndex) => {
    const row = educationData[degreeIndex][qualIndex];

    if (
      !row.degree?.trim() ||
      !row.branch?.trim() ||
      !row.institute?.trim() ||
      !row.year?.trim()
    ) {
      alert("Please fill all fields before saving.");
      return;
    }

    if(degreeIndex === 2){
      setPhdSelected(true)
    }

    setEducationData((prev) => {
      const updated = [...prev];
      const degreeArr = [...updated[degreeIndex]];
      degreeArr[qualIndex] = { ...degreeArr[qualIndex], saved: true };
      updated[degreeIndex] = degreeArr;
      return updated;
    });
  };

  // Cancel: remove ONLY unsaved cloned rows; never delete the first/original
  const cancelQualification = (degreeIndex, qualIndex) => {
    setEducationData((prev) => {
      const updated = [...prev];
      const degreeArr = [...updated[degreeIndex]];

      if (qualIndex === 0) return prev; // keep the original row
      if (!degreeArr[qualIndex].saved) {
        degreeArr.splice(qualIndex, 1);
        updated[degreeIndex] = degreeArr;
      }
      return updated;
    });
  };


  const degreeTitles = ["UG", "PG", "PhD"];

  

// console.log(bookPubCollections);


  // const handleCheckFacultyType =  (e) => {
  //       setFacultyType(e.target.value);
  //     }
      
  const isValidFacEmail = (e)=> {
     const vecEmailFormat = /^[\w.-]+@velammal\.edu\.in$/;
     
     const facEmailValidation = vecEmailFormat.test(e)
     if(facEmailValidation === true){
        setFacultyValidedEmail(facultyValidedEmail)
     }else {
      alert("Enter the valid E- mail")
      setFacultyValidedEmail("")
     }

  }


useEffect(() => {
  setExperienceCollections((prev) =>
    prev.map((exp) => {
      if (exp.fromDate && exp.toDate) {
        const from = new Date(exp.fromDate);
        const to = new Date(exp.toDate);

        let expYears = to.getFullYear() - from.getFullYear();
        let expMonths = to.getMonth() - from.getMonth();
        let expDays = to.getDate() - from.getDate();

        if (expDays < 0) {
          expMonths -= 1;
          expDays += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
        }
        if (expMonths < 0) {
          expYears -= 1;
          expMonths += 12;
        }

        return {
          ...exp,
          experience: `${expYears} Years - ${expMonths} Months`,
        };
      }
      return exp;
    })
  );
}, [experienceCollections.map((exp) => exp.fromDate + exp.toDate).join(",")]);


const handleGeneralInfoChange = (key, value) => {
  if (key==="joined_year" && value.length > 4){
    value = value.slice(0,4)
  }
  if( key==="joined_year" && value > todayDate && value.length === 4 ){
    value = todayDate
  }
  setGeneralInformation((prev) => ({
    ...prev,
    [key]: value,
  }));
};
// console.log(experienceCollections);

function validateCollection(collection, sectionName) {
  const checkArray = (arr) => {
    return arr.every((item) => {
      const values = Object.values(item).filter(
        (v) => typeof v === "string" || typeof v === "number"
      );

      const allEmpty = values.every((v) => v === "" || v === null || v === undefined);

      if (allEmpty) {
        return true; // completely skipped, allowed
      }

      const allFilled = values.every((v) => v !== "" && v !== null && v !== undefined);

      return allFilled && item.saved === true; // only valid if Done clicked
    });
  };

  // Handle nested like educationData
  const valid = Array.isArray(collection[0]) 
    ? collection.every((subArr) => checkArray(subArr)) 
    : checkArray(collection);

  if (!valid) {
    alert(`Please complete and save all ${sectionName} entries before submitting.`);
    return false;
  }

  return true;
}




const facultyFormSubmited = (e) => {
  e.preventDefault(); // prevent page reload


  if (!validateCollection(bookPubCollections, "Book Publications")) return;
  if (!validateCollection(patentCollections, "Patents")) return;
  if (!validateCollection(projectCollections, "Funded Projects")) return;
  if (!validateCollection(journalCollections, "Journals")) return;
  if (!validateCollection(researchCollections, "Research Scholars")) return;
  if (!validateCollection(experienceCollections, "Experience")) return;
  if (!validateCollection(educationData, "Education")) return;
  if (!validateCollection(conferenceCollections, "Conferences")) return;

  // ✅ If all checks pass
  console.log("All valid, submitting data...");

  const formData = {
    generalInformation,
    mediaLink,
    educationData,
    experienceCollections,
    bookPubCollections,
    patentCollections,
    projectCollections,
    journalCollections,
    researchCollections,
    conferenceCollections,
  };

  console.log("Final Form Data:", formData);


};

  return (
    <>
      <h1 className="page-title">Faculty Updation Form </h1>
      <form className="Form-container" onSubmit={facultyFormSubmited}>
        <h1 className="form-header"> UPDATE FORM</h1>

        {/* BASIC DETAILS */}
        <div className="tile">
          <h2>Basic Details</h2>
        <div className=" Basic-detail">
            <div className="basic-left">

            <div className="fac-namesession">
                <div className="fac-namedetails">
                  <label htmlFor="title">Title <span style={{color:"red" , fontSize: "20px"}}>*</span></label> 
                  <select 
                    id="title" 
                    value={generalInformation.title} 
                    onChange={(e) => handleGeneralInfoChange("title", e.target.value)} 
                    required
                  >
                    <option value="" disabled hidden>--- E.g : Dr , Mr , Mrs ---</option>
                    <option value="Dr">Dr</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                  </select>


                  <label htmlFor="name"> First Name  <span style={{color:"red" , fontSize: "20px"}}>*</span> </label>
                 <input
                    id="name"
                    type="text"
                    placeholder="E.g : JOHN"
                    value={generalInformation.name}
                    onChange={(e) => handleGeneralInfoChange("name", e.target.value.toUpperCase())}
                    required
                  />

                 

                  <label htmlFor="name">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="E.g : DOE"
                    value={generalInformation.last_name}
                    onChange={(e) => handleGeneralInfoChange("last_name", e.target.value.toUpperCase())}
                  />
                  
                  <label htmlFor="surname">
                    Initial/Surname 
                  <span style={{color:"red" , fontSize: "20px"}}>*</span>
                  </label>
                 <input
                  id="surname"
                  type="text"
                  placeholder="E.g : R"
                  value={generalInformation.surname}
                  onChange={(e) => handleGeneralInfoChange("surname", e.target.value.toUpperCase())}
                  required
                />
                </div>
              <div className="fac-image">
                 <span style={{color:"red" , fontSize: "18px",fontWeight:"lighter"}}>* <i>( The photo should under 10MB  )</i></span>
              <div className="photo-preview">
                {photoPreview ? (
                  <img src={photoPreview} alt="Faculty" />
                ) : (
                  <span>Passport Size Photo</span>
                )}
              </div>
              <label htmlFor="photoUpload" className="upload-btn">
                Upload Photo 
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  hidden
                  onChange={handlePhotoUpload}
                  required
                  />
              </label>
              </div>
            </div>
              
            <div className="fac-basicdetails">

              <div className="form-group">
              <label htmlFor="facultyType">Faculty Type  <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <select id="facultyType" value={generalInformation.category} onChange={(e) => handleGeneralInfoChange("category", e.target.value)} required>
                <option value="" disabled selected hidden >-- Select Faculty Type  --</option>
                <option value="Teaching Faculty">Teaching Faculty</option>
                <option value="Non-Teaching Faculty">Non Teaching Faculty</option>
              </select>
              </div>
              
             {generalInformation.category === "Teaching Faculty" ? (
               <div className="form-group">

              <label htmlFor="teachingDesignation">Designation <span style={{color:"red" , fontSize: "20px"}}>*</span> </label>
              <select id="teachingDesignation" value={generalInformation.designation} 
               onChange={(e) => handleGeneralInfoChange("designation", e.target.value)} required>

                <option value="" disabled selected hidden>-- Select Designation --</option>
                <option value="Professor">Head of the department </option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
              </div>
             ):( generalInformation.category === "Non-Teaching Faculty" ? (
                <div className="form-group">
              <label htmlFor="nonTeachingDesignation">Designation <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <select id="nonTeachingDesignation" value={generalInformation.designation}
               onChange={(e) => handleGeneralInfoChange("designation", e.target.value)} required>

                <option value="" disabled selected hidden>-- Select Designation --</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Lab Instructor">Lab Instructor</option>
              </select>
              </div>
             ):(
               <div className="form-group">
              <label htmlFor="nullDesignation">Designation <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <select id="nullDesignation" required>

                <option value="" disabled selected hidden>-- Fill Faculty Type   --</option>
               
              </select>
              </div>
             )
             
               )
             }
              <div className="form-group">
              <label htmlFor="joined">Joined In <span style={{color:"red" , fontSize: "20px"}}>*</span> </label>
              <input
              id="joined"
              type="number"
              min={2000}
              maxLength={4}
              value={generalInformation.joined_year}
              max={new Date().getFullYear()}
              onChange={(e) => handleGeneralInfoChange("joined_year", e.target.value)}
              required
              onKeyDown={(e) => {
               // prevent typing e, E, +, - and .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
              </div>

              <div>

              <label htmlFor="department">Department <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <select id="department"  value={generalInformation.department_name}
                onChange={(e) => handleGeneralInfoChange("department_name", e.target.value)} required>
                <option value="" selected disabled hidden>-- Select Department --</option>
                <option value="AI_DS">Artificial Intelligence and Data Science</option>
                <option value="AUTO">Automobile Engineering</option>
                <option value="CHEM">Chemistry</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="CSE_CS">Computer Science and Engineering (Cyber Security)</option>
                <option value="EEE">Electrical and Electronics Engineering</option>
                <option value="EIE">Electronics & Instrumentation Engineering</option>
                <option value="ECE">Electronics and Communication Engineering</option>
                <option value="ENG">English</option>
                <option value="IT">Information Technology</option>
                <option value="MATH">Mathematics</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="TAM">Tamil</option>
                <option value="PHY">Physics</option>
                <option value="MECSE">Master Of Computer Science</option>
                <option value="MBA">Master of Business Administration</option>
                <option value="PS">Power Systems</option>
              </select>
              </div>

              <div className="form-group">
              <label htmlFor="email">Email <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input id="email" type="email" placeholder="E.g : ajith@velammal.edu.in" value={generalInformation.mail_id}  onChange={(e) => handleGeneralInfoChange("mail_id", e.target.value)} required onBlur={(e)=>isValidFacEmail(e.target.value)} />
              </div>
            </div>
        </div>
        </div>
        </div>

        {/* SOCIAL MEDIA LINKS */}
        <div className="tile">

          <h2>Social Media Links</h2>
        <div className=" two-column">
        <div className="form-group">
          <label htmlFor="googleScholar">Google Scholar</label>
       
            <input
              id="googleScholar"
              type="text"
              placeholder={`E.g :${mediaLink.scholarprefix}`}
              onChange={((e)=>(handleLinkChange("scholarprefix",e.target.value)))}
            />
         
        </div>
          <div className="form-group">
            <label htmlFor="researchGate">ResearchGate</label>
            <input id="researchGate" type="text"  placeholder={`E.g: ${mediaLink.researchprefix}`}
            onChange={((e)=>(handleLinkChange("researchprefix",e.target.value)))}/>
          </div>
          <div className="form-group">
            <label htmlFor="orchidProfile">Orchid Profile</label>
            <input id="orchidProfile" type="text"  placeholder={`E.g :${mediaLink.orchidprefix}`}
             onChange={((e)=>(handleLinkChange("orchidprefix",e.target.value)))}/>
          </div>
          <div className="form-group">
            <label htmlFor="publonProfile">Publon Profile</label>
            <input id="publonProfile" type="text"  placeholder={`E.g :${mediaLink.publonprefix}`}
             onChange={((e)=>(handleLinkChange("publonprefix",e.target.value)))}/>
          </div>
          <div className="form-group">
            <label htmlFor="scopus">Scopus</label>
            <input id="scopus" type="text"  placeholder={`E.g :${mediaLink.scopusprefix}`}
             onChange={((e)=>(handleLinkChange("scopusprefix",e.target.value)))} />
          </div>
          <div className="form-group">
            <label htmlFor="linkedin">LinkedIn</label>
            <input id="linkedin" type="text"  placeholder={`E.g :${mediaLink.linkedinprefix}`}
             onChange={((e)=>(handleLinkChange("linkedinprefix",e.target.value)))} />
          </div>
        </div>
        </div>

        {/* EDUCATIONAL QUALIFICATIONS */}
        <div className="tile">
        <h2>Educational Qualifications</h2>

      {degreeTitles.map((title, degreeIndex) => (
        <div key={degreeIndex} className="education-qualification-type border-2 p-2">
          <h3 className="text-center my-2 text-2xl">{title}</h3>

          {(educationData[degreeIndex] || []).map((qualification, qualIndex) => (
          <div>
            <div className="two-column" key={qualIndex}>
              {/* Degree */}
              <div className="form-group">
                <label>
                  Degree <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={qualification.degree}
                  disabled={qualification.saved}
                  onChange={(e) =>
                    handleInputChange(degreeIndex, qualIndex, "degree", e.target.value)
                  }

                >
                  <option value="" disabled hidden>
                    -- Select Degree --
                  </option>
                  <option value="B.Tech">Bachelor of Technology (B.Tech)</option>
                  <option value="B.E">Bachelor of Engineering (B.E)</option>
                </select>
              </div>

              {/* Branch */}
              <div className="form-group">
                <label>
                  Branch <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  style={{ textTransform: "uppercase" }}
                  type="text"
                  placeholder="E.g : AI&DS"
                  value={qualification.branch}
                  disabled={qualification.saved}
                  onChange={(e) =>
                    handleInputChange(degreeIndex, qualIndex, "branch", e.target.value)
                  }
              
                />
              </div>

              {/* Institute */}
              <div className="form-group">
                <label>
                  Institute <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.g : Velammal Engineering College"
                  value={qualification.institute}
                  disabled={qualification.saved}
                  onChange={(e) =>
                    handleInputChange(degreeIndex, qualIndex, "institute", e.target.value)
                  }
    
                />
              </div>

              {/* Year */}
              <div className="form-group">
                <label>
                  Year <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  // max={todayDate}
                  maxLength={4}
                  min={1950}
                   onKeyDown={(e) => {
               // prevent typing e, E, +, - and .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              max={new Date().getFullYear()}
                  value={qualification.year}
                  disabled={qualification.saved}
                  onChange={(e) =>
                    handleInputChange(degreeIndex, qualIndex, "year", e.target.value)
                  }
        
                />
              </div>

                  </div>
              {/* Buttons for this row (same flow as Experience) */}
              <div className="book-submit-button">
                {qualIndex !== 0 && !qualification.saved && (
                  <button
                    type="button"
                    onClick={() => cancelQualification(degreeIndex, qualIndex)}
                    className="flex gap-2 bg-[#fdcc03] px-3 py-2 text-base rounded-xl text-text hover:text-prim hover:bg-[#800000]"
                  >
                    <Trash /> Cancel
                  </button>
                )}

                {!qualification.saved && (
                  <button
                    type="button"
                    onClick={() => doneQualification(degreeIndex, qualIndex)}
                    className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
                  >
                    <FolderLock /> Done
                  </button>
                )}

                {qualification.saved && (
                  <button
                    type="button"
                    onClick={() => addQualification(degreeIndex)}
                    className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
                  >
                    <CopyPlus /> Add New
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>

        {/* EXPERIENCE */}
        <fieldset className="tile">
      <h2>Experience</h2>

      {experienceCollections.map((exp, index) => (
        <div>

        <div
          key={index}
          className="two-column border-4 p-3 m-2 rounded-md"
          >
          <div className="form-group">
            <label htmlFor={`expFrom-${index}`}>
              Duration From <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`expFrom-${index}`}
              type="date"
              max={todayDate}
              value={exp.fromDate}
              disabled={exp.saved}
              onChange={(e) => handleExperience(index, "fromDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`expTo-${index}`}>
              Duration To <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`expTo-${index}`}
              type="date"
              min={exp.fromDate}
              max={todayDate}
              value={exp.toDate}
              disabled={exp.saved}
              onChange={(e) => handleExperience(index, "toDate", e.target.value)}
              required
            />
          </div>
          {/* <div className="form-group">
            <label htmlFor={`experience-${index}`}>
              Experience <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`experience-${index}`}
              type="text"
              value={Facexp}
              onChange={(e) => handleExperience(index, "experience", e.target.value)}
              required
            />
          </div> */}
          <div className="form-group">
          <label  htmlFor={`experience-${index}`}> Expriences
            <span style={{color:"green" , fontSize: "16px",fontWeight:"lighter"}}>* <i>(Your Experience will set based on your duration from and duration to)</i></span> 
          </label>
          <input id={`experience-${index}`} type="text" value={exp.experience}  readOnly
          //  onChange={(e) => handleExperience(index, "experience", e.target.value)} 

           /> 
          </div>

          <div className="form-group">
            <label htmlFor={`expDesignation-${index}`}>
              Designation <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`expDesignation-${index}`}
              type="text"
              value={exp.designation}
              disabled={exp.saved}
              onChange={(e) => handleExperience(index, "designation", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor={`institution-${index}`}>
              Institution <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`institution-${index}`}
              type="text"
              value={exp.institution}
              disabled={exp.saved}
              onChange={(e) => handleExperience(index, "institution", e.target.value)}
              required
            />
          </div>
          </div>

          <div className="book-submit-button">
            {index !== 0 && !exp.saved && (
              <button
                type="button"
                onClick={() => experienceButtonCancel(index)}
                className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
              >
                <Trash /> Cancel
              </button>
            )}

            {!exp.saved && (
              <button
                type="button"
                onClick={() => experienceButtonDone(index)}
                className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
              >
                <FolderLock /> Done
              </button>
            )}

            {exp.saved && (
              <button
                type="button"
                onClick={experienceButtonAdd}
                className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
              >
                <Plus /> Add New
              </button>
            )}
          </div>
        </div>
      ))}
    </fieldset>


        {/* The same pattern continues for all other sections */}
        {/* BOOK PUBLICATIONS */}
       <fieldset className="tile">
      <h2>Book Publications</h2>
      <div>
        {bookPubCollections.map((bookPubData, index) => (
          <div>

          <div
            key={index}
            className="two-column map-content-details border-4 p-3 m-2 rounded-md"
            >
            <div className="form-group">
              <label htmlFor={`author-${index}`}>
                Author <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`author-${index}`}
                type="text"
             
                value={bookPubData.bookPubAuthor}
                onChange={(e) =>
                  handleBookPublication(index, "bookPubAuthor", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`bookName-${index}`}>
                Book Name / Edition{" "}
                <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`bookName-${index}`}
                type="text"
              
                value={bookPubData.bookPubName}
                onChange={(e) =>
                  handleBookPublication(index, "bookPubName", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`publisher-${index}`}>
                Publisher{" "}
                <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`publisher-${index}`}
                type="text"
              
                value={bookPubData.bookPublisher}
                onChange={(e) =>
                  handleBookPublication(index, "bookPublisher", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`isbn-${index}`}>
                ISBN / ISSN{" "}
                <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`isbn-${index}`}
                type="text"
                value={bookPubData.bookPubISBN}
                onChange={(e) =>
                  handleBookPublication(index, "bookPubISBN", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`bookMonthYear-${index}`}>
                Year{" "}
                <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`bookMonthYear-${index}`}
                type="number"
                max={new Date().getFullYear()}
                min={1950}
                maxLength={4}
              
                onKeyDown={(e) => {
               // prevent typing e, E, +, - and .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
                value={bookPubData.bookPubyear}
                onChange={(e) =>
                  handleBookPublication(index, "bookPubyear", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`bookType-${index}`}>
                Type{" "}
                <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`bookType-${index}`}
                type="text"
              
                value={bookPubData.bookPubType}
                onChange={(e) =>
                  handleBookPublication(index, "bookPubType", e.target.value)
                }
              />
            </div>

           </div>
            <div className="book-submit-button">
              {index !== 0 && !bookPubData.saved && (
                <button
                  type="button"
                  onClick={() => bookPubButtonCancel(index)}
                  className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
                >
                  <Trash /> Cancel
                </button>
              )}

              {!bookPubData.saved && (
                <button
                type="button"
                  onClick={() => bookPubButtonDone(index)}
                  className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
                >
                  <FolderLock /> Done
                </button>
              )}

              {bookPubData.saved && (
                <button
                type="button"
                  onClick={bookPubButtonAdd}
                  className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
                >
                  <Plus /> Add New
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>

        {/* PATENTS */}
    <fieldset className="tile">
  <h2>Patents</h2>

  {patentCollections.map((patentData, index) => (
    <div>
    <div
      key={index}
      className="two-column border-4 p-3 m-2 rounded-md"
    >
      <div className="form-group">
        <label htmlFor={`patentName-${index}`}>
          Name of Patent <span style={{ color: "red", fontSize: "20px" }}>*</span>
        </label>
        <input
          id={`patentName-${index}`}
          type="text"
        
          value={patentData.patentName}
          onChange={(e) => handlePatents(index, "patentName", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`patentType-${index}`}>
          Patent Type <span style={{ color: "red", fontSize: "20px" }}>*</span>
        </label>
        <input
          id={`patentType-${index}`}
          type="text"
      
          value={patentData.patentType}
          onChange={(e) => handlePatents(index, "patentType", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`country-${index}`}>
          Country <span style={{ color: "red", fontSize: "20px" }}>*</span>
        </label>
        <input
          id={`country-${index}`}
          type="text"
   
          value={patentData.patentCountry}
          onChange={(e) => handlePatents(index, "patentCountry", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`status-${index}`}>
          Status <span style={{ color: "red", fontSize: "20px" }}>*</span>
        </label>
        <input
          id={`status-${index}`}
          type="text"
        
          value={patentData.patentStatus}
          onChange={(e) => handlePatents(index, "patentStatus", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`patentDate-${index}`}>
          Date of Recent Achieved Level{" "}
          <span style={{ color: "red", fontSize: "20px" }}>*</span>
        </label>
        <input
          id={`patentDate-${index}`}
          type="text"
    
          value={patentData.patentRecentAchieved}
          onChange={(e) =>
            handlePatents(index, "patentRecentAchieved", e.target.value)
          }
        />
      </div>

     </div>
     
      <div className="book-submit-button">
        {index !== 0 && !patentData.saved && (
          <button
            type="button"
            onClick={() => patentButtonCancel(index)}
            className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
          >
            <Trash /> Cancel
          </button>
        )}

        {!patentData.saved && (
          <button
            type="button"
            onClick={() => patentButtonDone(index)}
            className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
          >
            <FolderLock /> Done
          </button>
        )}

        {patentData.saved && (
          <button
            type="button"
            onClick={patentButtonAdd}
            className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
          >
            <Plus /> Add New
          </button>
        )}
      </div>
    </div>
  ))}
</fieldset>


        {/* PROJECTS */}
      <fieldset className="tile">
      <h2>Funded Projects</h2>
      <div>
        {projectCollections.map((project, index) => (
          <div>

          <div
            key={index}
            className="two-column map-content-details border-4 p-3 m-2 rounded-md"
            >
            <div className="form-group">
              <label htmlFor={`title-${index}`}>
                Project Title <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`title-${index}`}
                type="text"
                
                value={project.projectTitle}
                onChange={(e) =>
                  handleProjects(index, "projectTitle", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`sponsoring-${index}`}>
                Sponsoring Agency <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`sponsoring-${index}`}
                type="text"
               
                value={project.projectSponsoring}
                onChange={(e) =>
                  handleProjects(index, "projectSponsoring", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`amount-${index}`}>
                Amount Sanctioned <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`amount-${index}`}
                type="number"
                min={0}
                      onKeyDown={(e) => {
               // prevent typing e, E, +, - and .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              
                value={project.projectAmount}
                onChange={(e) =>
                  handleProjects(index, "projectAmount", e.target.value)
                }
                />
            </div>

            <div className="form-group">
              <label htmlFor={`sanction-${index}`}>
                Sanction Number <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`sanction-${index}`}
                type="text"
            
                value={project.projectSanction}
                onChange={(e) =>
                  handleProjects(index, "projectSanction", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`duration-${index}`}>
                Duration <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`duration-${index}`}
                type="text"
                value={project.projectDuration}
                onChange={(e) =>
                  handleProjects(index, "projectDuration", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`responsibility-${index}`}>
                Responsibility <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`responsibility-${index}`}
                type="text"
           
                value={project.projectResponsibility}
                onChange={(e) =>
                  handleProjects(index, "projectResponsibility", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor={`status-${index}`}>
                Status <span style={{ color: "red", fontSize: "20px" }}>*</span>
              </label>
              <input
                id={`status-${index}`}
                type="text"
           
                value={project.projectStatus}
                onChange={(e) =>
                  handleProjects(index, "projectStatus", e.target.value)
                }
                />
            </div>

            </div>
            <div className="book-submit-button">
              {index !== 0 && !project.saved && (
                <button
                type="button"
                onClick={() => projectButtonCancel(index)}
                className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
                >
                  <Trash /> Cancel
                </button>
              )}

              {!project.saved && (
                <button
                type="button"
                onClick={() => projectButtonDone(index)}
                className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
                >
                  <FolderLock /> Done
                </button>
              )}

              {project.saved && (
                <button
                  type="button"
                  onClick={projectButtonAdd}
                  className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
                >
                  <Plus /> Add New
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>

        {/* JOURNAL PUBLICATIONS */}
   <fieldset className="tile">
      <h2>Journal Publications</h2>
      <div>
        {journalCollections.map((journal, index) => (
        <div>
          <div
            key={index}
            className="two-column map-content-details border-4 p-3 m-2 rounded-md"
          >
            <div className="form-group">
              <label>Author <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="text"
             
                value={journal.journalAuthor}
                onChange={(e) =>
                  handleJournal(index, "journalAuthor", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Title <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="text"
                // required
                value={journal.journalTitle}
                onChange={(e) =>
                  handleJournal(index, "journalTitle", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Journal Name <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="text"
                // required
                value={journal.journalName}
                onChange={(e) =>
                  handleJournal(index, "journalName", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>DOI Number <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="text"
                // required
                value={journal.journalDOINum}
                onChange={(e) =>
                  handleJournal(index, "journalDOINum", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Page Number <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="number"
                // required
                min={0}
                value={journal.journalPageNum}
                onChange={(e) =>
                handleJournal(index, "journalPageNum", e.target.value)
                }
                 onKeyDown={(e) => {
               
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              />
            </div>

            <div className="form-group">
              <label>Volume & Issue <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="number"
                // required
                min={0}
                value={journal.journalVolumeAndIssue}
                onChange={(e) =>
                  handleJournal(index, "journalVolumeAndIssue", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label> Year <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="number"
                max={1950}
                maxLength={4}
                value={journal.journalMonthAndYear}
                onChange={(e) =>
                  handleJournal(index, "journalMonthAndYear", e.target.value)
                }
                 onKeyDown={(e) => {
               
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}

              
              />
            </div>

            <div className="form-group">
              <label>Indexed <span style={{color:"red" , fontSize: "20px"}}>*</span></label>
              <input
                type="text"
                // required
                value={journal.journalIndexed}
                onChange={(e) =>
                  handleJournal(index, "journalIndexed", e.target.value)
                }
              />
            </div>

               </div>
            <div className="book-submit-button">
              {index !== 0 && !journal.saved && (
                <button
                  type="button"
                  onClick={() => journalButtonCancel(index)}
                  className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
                >
                  <Trash /> Cancel
                </button>
              )}

              {!journal.saved && (
                <button
                  type="button"
                  onClick={() => journalButtonDone(index)}
                  className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
                >
                  <FolderLock /> Done
                </button>
              )}

              {journal.saved && (
                <button
                  type="button"
                  onClick={journalButtonAdd}
                  className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
                >
                  <Plus /> Add New
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>

        {/* RESEARCH SCHOLARS */}

      {phdSelected && 
      <fieldset className="tile">
      <h2>Research Scholars</h2>

      {researchCollections.map((research, index) => (
        
        <div>
        <div
          key={index}
          className="two-column border-4 p-3 m-2 rounded-md"
          >
          <div className="form-group">
            <label htmlFor={`researchName-${index}`}>
              Name <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`researchName-${index}`}
              type="text"
              // required
              value={research.researchName}
              onChange={(e) =>
                handleResearch(index, "researchName", e.target.value)
              }
              />
          </div>

          <div className="form-group">
            <label htmlFor={`researchTitle-${index}`}>
              Research Title <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`researchTitle-${index}`}
              type="text"
              // required
              value={research.researchTitle}
              onChange={(e) =>
                handleResearch(index, "researchTitle", e.target.value)
              }
              />
          </div>

          <div className="form-group">
            <label htmlFor={`researchCategory-${index}`}>
              Category <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`researchCategory-${index}`}
              type="text"
              // required
              value={research.researchCategory}
              onChange={(e) =>
                handleResearch(index, "researchCategory", e.target.value)
              }
              />
          </div>

          <div className="form-group">
            <label htmlFor={`researchStatus-${index}`}>
              Status <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`researchStatus-${index}`}
              type="text"
              // required
              value={research.researchStatus}
              onChange={(e) =>
                handleResearch(index, "researchStatus", e.target.value)
              }
              />
          </div>

          <div className="form-group">
            <label htmlFor={`degreeAwarded-${index}`}>
              Month & Year of Degree Awarded{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`degreeAwarded-${index}`}
              type="text"
              // required
              value={research.researchDegreeAward}
              onChange={(e) =>
                handleResearch(index, "researchDegreeAward", e.target.value)
              }
              />
          </div>
          </div>

          <div className="book-submit-button">
            {index !== 0 && !research.saved && (
              <button
              type="button"
              onClick={() => researchButtonCancel(index)}
                className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
              >
                <Trash /> Cancel
              </button>
            )}

            {!research.saved && (
              <button
              type="button"
              onClick={() => researchButtonDone(index)}
              className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
              >
                <FolderLock /> Done
              </button>
            )}

            {research.saved && (
              <button
              type="button"
              onClick={researchButtonAdd}
              className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
              >
                <Plus /> Add New
              </button>
            )}
          </div>
        </div>
      ))}
    </fieldset>
    }
     <fieldset className="tile">
      <h2>Conference Publications</h2>

      {conferenceCollections.map((conference, index) => (

        <div>
        <div
          key={index}
          className="two-column border-4 p-3 m-2 rounded-md"
        >
          <div className="form-group">
            <label htmlFor={`conferenceAuthor-${index}`}>
              Author <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceAuthor-${index}`}
              type="text"
              // required
              value={conference.conferenceAuthor}
              onChange={(e) =>
                handleConference(index, "conferenceAuthor", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor={`conferenceTitle-${index}`}>
              Conference Title{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceTitle-${index}`}
              type="text"
              // required
              value={conference.conferenceTitle}
              onChange={(e) =>
                handleConference(index, "conferenceTitle", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor={`conferenceName-${index}`}>
              Conference Name{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceName-${index}`}
              type="text"
              // required
              value={conference.conferenceName}
              onChange={(e) =>
                handleConference(index, "conferenceName", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor={`conferenceOrganizedBy-${index}`}>
              Organized By{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceOrganizedBy-${index}`}
              type="text"
              // required
              value={conference.conferenceOrganizedBy}
              onChange={(e) =>
                handleConference(index, "conferenceOrganizedBy", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor={`conferenceISBN-${index}`}>
              ISBN / ISSN No{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceISBN-${index}`}
              type="text"
              // required
              value={conference.conferenceISBN}
              onChange={(e) =>
                handleConference(index, "conferenceISBN", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor={`conferenceMonthAndYear-${index}`}>
              Year{" "}
              <span style={{ color: "red", fontSize: "20px" }}>*</span>
            </label>
            <input
              id={`conferenceMonthAndYear-${index}`}
              type="number"
              // required
                max={new Date().getFullYear()}
                maxLength={4}
                 onKeyDown={(e) => {
               // prevent typing e, E, +, - and .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              value={conference.conferenceMonthAndYear}
              onChange={(e) =>
                handleConference(
                  index,
                  "conferenceMonthAndYear",
                  e.target.value
                )
              }
            />
          </div>
         </div>

          {/* Buttons */}
          <div className="book-submit-button">
            {index !== 0 && !conference.saved && (
              <button
                type="button"
                onClick={() => conferenceButtonCancel(index)}
                className="flex gap-2 bg-[#fdcc03] px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-[#800000]"
              >
                <Trash /> Cancel
              </button>
            )}

            {!conference.saved && (
              <button
                type="button"
                onClick={() => conferenceButtonDone(index)}
                className="flex gap-2 bg-gray-400 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-gray-500"
              >
                <FolderLock /> Done
              </button>
            )}

            {conference.saved && (
              <button
                type="button"
                onClick={conferenceButtonAdd}
                className="flex gap-2 bg-green-500 px-3 py-2 rounded-xl text-text hover:text-prim hover:bg-green-700"
              >
                <Plus /> Add New
              </button>
            )}
          </div>
        </div>
      ))}
    </fieldset>

          <div className="faculty-submit-button">
            <button type="submit">  Submit </button>
          </div>
      </form>
    </>
  );
};

export default Update_Form;


