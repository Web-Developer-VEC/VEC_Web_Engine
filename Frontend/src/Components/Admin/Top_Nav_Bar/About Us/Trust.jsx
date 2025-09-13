import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Banner from '../../Banner';
import './Trust.css'
import LoadComp from '../../LoadComp';
import { ArrowBigLeftDash, CircleCheck, Pencil, Trash2, Upload, UserRoundPlus } from 'lucide-react';
import { FaCheckCircle, FaTimesCircle, FaUserEdit } from 'react-icons/fa';

const NewTrust = ({theme, toggle}) => {

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [strengthOfTrustButton,setStrengthOfTrustButton] = useState(false);
  const [educationalTrustButton,setEducationalTrustButton] = useState(false);

  const [splittedEducationalFirstone , setSpittedEducationalFirstTrust] = useState("  In the year 1986... Smt.Velammal had sown the seed of social consciousness  in the mind of her son Shri. M.V Muthuramalingam, Founder Chairman of Velammal Educational Trust, at his impressionable age, which started germinating and sprouting the outcome - establishing Velammal Matriculation School at Chennai with a strength of only 183 students and 13 staff members.")
  const [splittedEducationalSecondone , setSpittedEducationalSecondTrust] = useState(" From a small school at Mugappair in Chennai, to an established educational brand of Tamilnadu. The Velammal Group of institutions has spread to the districts of Thiruvallur, Kancheepuram, Sivagangai, Madurai, Theni, Karur, Thiruvanamalai, Thanjavur, and Vellore. Now this group holds more than a lakh students and around 12000 staff members under its umbrella.")
  const [strengthOfTrust,setStrengthOfTrust] = useState("Her Philosophy was quite simple, She used to say, You take care of the society and the society will reciprocate. You are not in isolation nor is your family. It is all a part of the society and the growth is interdependent. ")



  const originalStrengthOfTrust = useRef(strengthOfTrust)

    const strengthOfTrustEditClicking = () => {
   originalStrengthOfTrust.current = strengthOfTrust
  }

  const handleStrengthOfTrustCancel = () => {
    setStrengthOfTrust(originalStrengthOfTrust.current)
    setStrengthOfTrustButton(false)
  }

  const handleStrengthOfTrustSubmit = () => {
  originalStrengthOfTrust.current = strengthOfTrust
    setStrengthOfTrustButton(false)
  }


  
  const originalTextRefFirst = useRef(splittedEducationalFirstone)
  const originalTextRefSecond = useRef(splittedEducationalSecondone)
  
  const educationalTrustEditClick = ()=> {
    originalTextRefFirst.current = splittedEducationalFirstone
    originalTextRefSecond.current = splittedEducationalSecondone
  }
  
  const handleEducationalTrustCancel = () => {
    setSpittedEducationalFirstTrust(originalTextRefFirst.current)
    setSpittedEducationalSecondTrust(originalTextRefSecond.current)
    setEducationalTrustButton(false)
  
  }
  const handleeducationalTrustSubmit = () => {
    originalTextRefFirst.current = splittedEducationalFirstone
    originalTextRefSecond.current = splittedEducationalSecondone
    setEducationalTrustButton(false)
    alert("submitted")
  }


  const [managementTeam, setManagementTeam] = useState([
    {
      name: "Shri. M.V. Muthuramalingam",
      role: "Chairman",
      desc: "Velammal Educational Trust",
      image: "/static/images/trust/muthuramalingam.webp",
      editing: false,
    },
    {
      name: "Shri. M.V. VelMurugan",
      role: "Chief Executive Officer",
      desc: "Velammal Educational Trust",
      image: "/static/images/trust/velmurugan.webp",
      editing: false,
    },
    {
      name: "Shri. V. Karthik Velmurugan",
      role: "Deputy CEO",
      desc: "Velammal Educational Trust",
      image: "/static/images/trust/deptyceo.webp",
      editing: false,
    },
  ]);


  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
      };
  }, []);


   const toggleEdit = (index) => {
    const updated = [...managementTeam];
    updated[index].editing = !updated[index].editing;
    setManagementTeam(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...managementTeam];
    updated[index][field] = value;
    setManagementTeam(updated);
  };

  const handleImageUpload = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(index, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (index) => {
    const updated = managementTeam.filter((_, i) => i !== index);
    setManagementTeam(updated);
  };

  const handleAdd = () => {
    setManagementTeam([
      ...managementTeam,
      {
        name: "",
        role: "",
        desc: "",
        image: "/static/images/trust/default.webp",
        editing: true,
      },
    ]);
  };

    const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };


const handleStrengthOfTrustEditing = () => {
  setStrengthOfTrustButton(false)
}


  if (!isOnline) {
      return (
        <div className="h-screen flex items-center justify-center md:mt-[15%] md:block">
          <LoadComp txt={"You are offline"} />
        </div>
      );
  }

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <>
<Banner toggle={toggle} theme={theme}
  backgroundImage="./Banners/aboutvec.webp"
  headerText="Velammal Educational Trust"
  subHeaderText=" Transforming dreams into reality through a strong foundation of learning, leadership, and innovation."
/>

      <div className="bg-prim dark:bg-drkp min-h-screen px-4 pt-0 md:p-8">
          <div className="flex gap-4 justify-end pr-8 mt-2">
          <button className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black" onClick={() => setIsAdminEditing(true)}>
            <FaUserEdit className="mr-2" /> Edit
          </button>
          <button className="flex items-center bg-green-500 text-black px-3 py-2 rounded" onClick={() => { setIsAdminEditing(false); setEditingIndex(null); }}>
            <CircleCheck className="mr-2" />
            Confirm 
          </button>
        </div>


    <div className="mt-12 container1 text-text dark:text-drkt mx-auto px-6">
      <div>
        <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left text-text dark:text-drkt"
            >
      {isAdminEditing ? 
            (

              <>

       {educationalTrustButton  ? 
              (
              <>
              <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
              Velammal Educational Trust (VET)
              </h2>
              <textarea className="w-full p-2 border border-gray-300 rounded resize-none overflow-hidden" value={splittedEducationalFirstone} onFocus={educationalTrustEditClick} onChange={(e)=>{setSpittedEducationalFirstTrust(e.target.value)}} />
              <textarea className="w-full p-2 border border-gray-300 rounded resize-none overflow-hidden" value={splittedEducationalSecondone} onChange={(e)=>{setSpittedEducationalSecondTrust(e.target.value)}} rows={6}  />

                <div className="flex gap-4 justify-end pt-4 pr-16">
                  <button className="bg-green-500 px-3 py-2 rounded text-white" onClick={handleeducationalTrustSubmit}>
                    <FaCheckCircle className="mr-2 inline" /> Submit

                  </button>
                  <button className="bg-red-500 px-3 py-2 rounded text-white" onClick={handleEducationalTrustCancel} >
                    <FaTimesCircle className="mr-2 inline" /> Cancel
                  </button>
                </div>
              </>
                


              ):(

                 <>
          <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
              Velammal Educational Trust (VET)
              </h2>
              <p className="text-lg leading-relaxed">
            {splittedEducationalFirstone}
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                   {splittedEducationalSecondone}
            </p>
           
            <div className='flex justify-end mr-3'>
           <button className="flex justify-end items-center bg-[#fdcc03] px-2 py-2 rounded text-black"   
              onClick={() => setEducationalTrustButton(true)}>
            <Pencil className='mr-2'/> Edit
            </button>
        </div>
        
              </>  
                

                
              )}
        
              </>
            ):
            (
              <>
              <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
              Velammal Educational Trust (VET)
              </h2>
              <p className="text-lg leading-relaxed">
            {splittedEducationalFirstone}
              </p>
              <p className="mt-4 text-lg leading-relaxed">
                   {splittedEducationalSecondone}
            </p>

              
              </>
            )}

              
        </motion.div>
       
      </div>
          <div className="mt-10 grid md:grid-cols-2 gap-8 items-center ">
            {/* Image Section */}
            <div>

            <motion.div
              whileHover={{  }}
              className="flex justify-center group overflow-hiaccn rounded-2xl saadow-lg"
              >
              <img
                className="w-64 h-100 object-contain transition-transform duration-500 "
                src={ selectedImage || UrlParser('/static/images/trust/velammal.webp')}
                alt="Velammal Trust Banner"
                accept="image/png, image/jpeg, image/jpg"
                />

            </motion.div>
            <div>
              {isAdminEditing && (
                 <div className="flex justify-center mt-2">
                    <button
                      className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
                      onClick={() => document.getElementById("vision-image-upload").click()}
                      >
                      <Upload className="mr-2" /> Upload Image
                    </button>
                    <input
                      id="vision-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      />
                  </div>
                )}
            </div>
            </div>

            {/* Text Section */}
            <div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left text-text dark:text-drkt"
              >

          {!isAdminEditing ? (

            <div>
  
                <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                  Strength of the Trust
                </h2>
                <p className="text-lg leading-relaxed">{strengthOfTrust} </p>
              
              </div>
          ):(
            <div>


      {!strengthOfTrustButton ? 
              (

             <>
              <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                  Strength of the Trust
                </h2>
                <p className="text-lg leading-relaxed">{strengthOfTrust} </p>

              <div className='flex justify-end mr-3'>
                <button className="flex justify-end items-center bg-[#fdcc03] px-2 py-2 rounded text-black" onClick={() => setStrengthOfTrustButton(true)}>
                <Pencil className='mr-2'/> Edit
                </button>
              </div>
             </>

              ):
              (
                <div>

                <h2 className="text-3xl text-brwn dark:text-drkt font-bold mb-4 border-b-4 border-secd dark:border-drks inline-block pb-2">
                  Strength of the Trust
                </h2>
                
                 <textarea className="w-full p-2 border border-gray-300 rounded resize-none overflow-hidden" value={strengthOfTrust} rows={6} onFocus={strengthOfTrustEditClicking} onChange={(e)=> setStrengthOfTrust(e.target.value)} />

                <div className="flex gap-4 justify-end pt-4 pr-16">
                  <button className="bg-green-500 px-3 py-2 rounded text-white" onClick={handleStrengthOfTrustSubmit}>
                    <FaCheckCircle className="mr-2 inline" /> Submit
                  </button>
                  <button className="bg-red-500 px-3 py-2 rounded text-white" onClick={handleStrengthOfTrustCancel}>
                    <FaTimesCircle className="mr-2 inline" /> Cancel
                  </button>
                </div>
                </div>

              )}
              
              </div>

          )}
          </motion.div>
            </div>
          </div>


      </div>



       
        {!isAdminEditing ? (
          <div className="mt-16 py-12 px-6 rounded-t-3xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-accn dark:text-drkt mb-6">The Management</h2>
          </div>
          <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-10 justify-evenly">
            {/* {managementTeam.map((person, index) => ( */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser("/static/images/trust/muthuramalingam.webp")}
                  alt="Shri. M.V. Muthuramalingam"
                  accept="image/png, image/jpeg, image/jpg"
                  className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. M.V. Muthuramalingam</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Chairman</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser('/static/images/trust/velmurugan.webp')}
                  alt="Shri. M.V. VelMurugan"
                   accept="image/png, image/jpeg, image/jpg"
                  className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. M.V. VelMurugan</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Chief Executive Officer</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                          dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                          text-text dark:text-drkt p-6 rounded-lg shadow-md 
                          hover:shadow-xl transition-shadow duration-300 md:flex"
              >
                <img
                  src={UrlParser("/static/images/trust/deptyceo.webp")}
                  alt="Shri. M.V. VelMurugan"
                  accept="image/png, image/jpeg, image/jpg"
                  className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                />

                <div>
                  <h5 className="text-sm font-bold">Shri. V. Karthik Velmurugan</h5>
                  <h6 className="text-sm text-accn dark:text-drka">Deputy CEO</h6>
                  <p className="mt-2">Velammal Educational Trust</p>
                </div>
              </motion.div>
            {/* ))} */}
          </div>
        </div>
          
        ): (
          <div className="bg-prim dark:bg-drkp min-h-screen px-4 pt-0 md:p-8">
        <div className="mt-16 py-12 px-6 rounded-t-3xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-accn dark:text-drkt mb-6">The Management</h2>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-10 justify-evenly">
            {managementTeam.map((person, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center bg-[color-mix(in_srgb,theme(colors.prim)_90%,black)] 
                  dark:bg-[color-mix(in_srgb,theme(colors.drkp)_95%,white)] 
                  text-text dark:text-drkt p-6 rounded-lg shadow-md 
                  hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center w-full">
                  <div className="relative">
                    <img
                      src={UrlParser(person.image)}
                      alt={person.name}
                       accept="image/png, image/jpeg, image/jpg"
                      className="management-image-1 md:w-40 md:h-40 mr-6 shadow-lg"
                    />
                    {person.editing && (
                      <div className="absolute bottom-1 left-1">
                        <label className="cursor-pointer flex items-center bg-[#fdcc03] text-black text-sm px-2 py-1 rounded">
                          <Upload className="mr-1 w-4 h-4" /> Upload
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => handleImageUpload(index, e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    {person.editing ? (
                      <>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handleChange(index, 'name', e.target.value)}
                          className="text-sm font-bold mb-1 rounded px-2 py-1"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={person.role}
                          onChange={(e) => handleChange(index, 'role', e.target.value)}
                          className="text-sm text-accn dark:text-drka mb-1 rounded px-2 py-1"
                          placeholder="Role"
                        />
                        <textarea
                          value={person.desc}
                          onChange={(e) => handleChange(index, 'desc', e.target.value)}
                          className="mt-1 rounded px-2 py-1"
                          placeholder="Description"
                        />
                      </>
                    ) : (
                      <>
                        <h5 className="text-sm font-bold">{person.name}</h5>
                        <h6 className="text-sm text-accn dark:text-drka">{person.role}</h6>
                        <p className="mt-2">{person.desc}</p>
                      </>
                    )}
                  </div>
                </div>
      
                <div className="w-full flex justify-end gap-2 mt-4">
                  <button
                    className="flex items-center w-fit bg-[#fdcc03] px-2 py-2 rounded text-black"
                    onClick={() => toggleEdit(index)}
                  >
                    <Pencil className="mr-1" />
                    {person.editing ? "Save" : "Edit"}
                  </button>
                  <button
                    className="flex items-center w-fit bg-[#fdcc03] px-2 py-2 rounded text-black"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="mr-1" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
            {isAdminEditing && (
          <div className="flex gap-4 justify-end pt-4 pr-8">
            <button
              className="flex items-center bg-[#fdcc03] px-3 py-2 rounded text-black"
              onClick={handleAdd}
            >
              <UserRoundPlus className="mr-1" />Add
            </button>
          </div>
            )}  
        </div>
      </div>
        )}

        

      </div>
    </>
  );
};

export default NewTrust;
