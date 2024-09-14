"use client";
import { useEffect, useState } from "react";
import { auth, db, storage } from "../../lib/firebaseConfig";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [servicesMap, setServicesMap] = useState({}); // لتخزين تفاصيل الخدمة حسب المعرف
  const router = useRouter();

  useEffect(() => {
    const fetchUserServices = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, "services"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const userServices = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setServices(userServices);

        // تخزين تفاصيل الخدمة في خريطة
        const servicesDataMap = {};
        userServices.forEach(service => {
          servicesDataMap[service.id] = service;
        });
        setServicesMap(servicesDataMap);
      }
    };

    const fetchUserRequests = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, "requests"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const userRequests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(userRequests);
      }
    };

    fetchUserServices();
    fetchUserRequests();
  }, [auth.currentUser]);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddService = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No user is logged in.");
        return;
      }

      const userName = user.displayName || user.email || "Unknown User";
      const imageRef = ref(storage, `images/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      const docRef = await addDoc(collection(db, "services"), {
        name,
        price,
        image: imageUrl,
        user: userName,
        userId: user.uid,
      });

      setServices((prevServices) => [...prevServices, { id: docRef.id, name, price, image: imageUrl, user: userName }]);
      setName("");
      setPrice("");
      setImage(null);
      alert("Service added successfully!");
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteDoc(doc(db, "services", serviceId));
      setServices((prevServices) => prevServices.filter((service) => service.id !== serviceId));
      alert("Service deleted successfully!");
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEditService = async (serviceId) => {
    const newName = prompt("Enter new name:");
    const newPrice = prompt("Enter new price:");

    if (newName && newPrice) {
      try {
        const serviceRef = doc(db, "services", serviceId);
        await updateDoc(serviceRef, { name: newName, price: newPrice });
        setServices((prevServices) =>
          prevServices.map((service) => (service.id === serviceId ? { ...service, name: newName, price: newPrice } : service))
        );
        alert("Service updated successfully!");
      } catch (error) {
        console.error("Error updating service:", error);
      }
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));
      notifySuccess('Request deleted successfully!');
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <nav className="flex justify-between p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="p-2 text-white bg-red-500 rounded">
          Logout
        </button>
      </nav>
      <form onSubmit={handleAddService} className="p-6 mt-6 bg-white shadow-md rounded">
        <h1 className="mb-4 text-xl font-semibold">Add Service</h1>
        <input
          type="text"
          placeholder="Service Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-500 rounded"
        >
          Add Service
        </button>
      </form>
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Your Services</h2>
        {services.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="p-4 bg-white shadow-lg rounded-lg">
                <img
                  src={service.image || "/placeholder.png"}
                  alt={service.name}
                  className="w-full h-40 rounded-lg object-cover"
                />
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
                  <p className="mt-2 text-lg font-semibold text-green-500">${service.price}</p>
                  <button
                    onClick={() => handleEditService(service.id)}
                    className="mt-4 mr-2 p-2 text-white bg-yellow-500 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="mt-4 p-2 text-white bg-red-500 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No services added yet.</p>
        )}
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Your Requests</h2>
        {requests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => (
              <div key={request.id} className="p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-bold text-gray-900">
                  Service Name: {servicesMap[request.serviceId]?.name || "Unknown Service"}
                </h2>
                <p className="mt-2 text-lg font-semibold text-gray-800">Status: {request.status}</p>
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className="mt-4 p-2 text-white bg-red-500 rounded"
                >
                  Delete Request
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No requests made yet.</p>
        )}
      </div>
    </div>
  );
}
