import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  User, Phone, MapPin, Building, Flag, Mail, Save, Loader2, Upload,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import multiavatar from "@multiavatar/multiavatar";
import { UserContext } from "../Context/userContext";

const ProfilePage = () => {
  const [originalData, formData, setFormData, setOriginalData, loading, , name] = useContext(UserContext);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const userId = localStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasChanged = Object.keys(formData).some(
      (key) => formData[key] !== originalData[key]
    );

    if (!hasChanged && !avatar) {
      toast("No changes made.", { icon: "ℹ️" });
      return;
    }

    setSaving(true);

    try {
      const cleanedData = { ...formData, userId };
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === "") delete cleanedData[key];
      });

      if (avatar) {
        const formDataImage = new FormData();
        formDataImage.append("avatar", avatar);
        formDataImage.append("userId", userId);
        await axios.post("http://localhost:5000/upload-avatar", formDataImage, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Avatar uploaded!");
      }

      const response = await axios.put("http://localhost:5000/details", cleanedData);
      const updatedForm = {
        fullName: response.data.fullName || "",
        phoneNumber: response.data.phoneNumber || "",
        addressLine1: response.data.addressLine1 || "",
        addressLine2: response.data.addressLine2 || "",
        city: response.data.city || "",
        state: response.data.state || "",
        postalCode: response.data.postalCode || "",
        country: response.data.country || "",
      };

      toast.success("Profile updated successfully!");
      setOriginalData(updatedForm);
      setFormData(updatedForm);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Login to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case "fullName": return <User size={18} className="text-indigo-500" />;
      case "phoneNumber": return <Phone size={18} className="text-indigo-500" />;
      case "addressLine1":
      case "addressLine2": return <MapPin size={18} className="text-indigo-500" />;
      case "city": return <Building size={18} className="text-indigo-500" />;
      case "state": return <MapPin size={18} className="text-indigo-500" />;
      case "postalCode": return <Mail size={18} className="text-indigo-500" />;
      case "country": return <Flag size={18} className="text-indigo-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-purple-100 py-10 px-4">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3">
        {/* Avatar & Basic Info */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center py-10 px-6">
          <div className="relative mb-6">
            <label htmlFor="avatar-upload" className="cursor-pointer group">
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="h-36 w-36 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: multiavatar(name || "User"),
                    }}
                  />
                )}
              </div>
            </label>
            <p className="text-xs text-indigo-200 mt-2 text-center">Click avatar to change</p>
          </div>
          <h2 className="text-2xl font-bold">{formData.fullName || "Your Name"}</h2>
          <p className="text-sm text-indigo-200 mt-1">Personal Info</p>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.keys(formData).map((field) => (
              <div key={field} className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </label>
                <div className="flex items-center border rounded-md p-2 bg-white shadow-sm focus-within:ring-2 ring-indigo-400 transition">
                  <span className="mr-2">{getFieldIcon(field)}</span>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-sm text-gray-700"
                  />
                </div>
              </div>
            ))}

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-md text-white font-semibold transition-all duration-300 ${
                  saving ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
