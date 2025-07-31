import React,{useState,useRef,useContext} from 'react';
import Card from '../components/Card';
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.png';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.png';
import image6 from '../assets/image6.jpeg';
import image7 from '../assets/image7.jpeg';
import { RiImageAddLine} from 'react-icons/ri';
import { MdKeyboardBackspace } from 'react-icons/md';
import { userDataContext } from '../context/UserContext';
import {useNavigate} from 'react-router-dom';

const Customize = () => {
  const {serverUrl,userData,setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage} = useContext(userDataContext);
  const navigate = useNavigate();
    
  const inputImage = useRef(null);

  const handleImage = (e) =>{
     const file = e.target.files[0];
     setBackendImage(file);
     setFrontendImage(URL.createObjectURL(file));
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex flex-col items-center justify-center p-5'>
      <MdKeyboardBackspace className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer' onClick={()=>navigate("/")} />
      <h1 className='text-white mb-10 text-3xl text-center'>
        Select Your <span className='text-pink-600'>Assistant Image..</span>
      </h1>
      <div className='w-full max-w-5xl flex flex-wrap justify-center items-center gap-4'>
        <Card image={image1}/>
        <Card image={image2}/>
        <Card image={image3}/>
        <Card image={image4}/>
        <Card image={image5}/>
        <Card image={image6}/>
        <Card image={image7}/>
        <div className={`w-[70px] h-[140px] lg:w-[180px] lg:h-[250px] bg-[#030326] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${selectedImage == "input" ? "border-4 border-white shadow-2xl shadow-blue-950" : null}`} onClick={()=>{
          inputImage.current.click()
          setSelectedImage("input");
          }}>
        {!frontendImage && <RiImageAddLine className='text-white w-[25px] h-[25px]' />}
        {frontendImage && <img src={frontendImage} className='h-full w-full object-cover' />}
        
        </div>
        <input type='file' accept='image/*' ref={inputImage} onChange={handleImage} hidden />
      </div>
      {selectedImage && <button className="min-w-[150px] h-[50px] mt-[30px] text-black font-bold bg-white rounded-full cursor-pointer" type="submit" onClick={()=>navigate("/customize2")}>
        Next
        </button>}
      
    </div>
  )
}

export default Customize;