"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebaseConfig";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [servicesMap, setServicesMap] = useState({}); // لتخزين تفاصيل الخدمة حسب المعرف

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesData);

        // تخزين تفاصيل الخدمة في خريطة
        const servicesDataMap = {};
        servicesData.forEach(service => {
          servicesDataMap[service.id] = service;
        });
        setServicesMap(servicesDataMap);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRequests = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const requestsSnapshot = await getDocs(collection(db, "requests"));
          const requestsData = requestsSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((request) => request.userId === user.uid);
          setUserRequests(requestsData);
        } catch (err) {
          console.error("Error fetching user requests:", err);
          setError("Failed to load your requests. Please try again later.");
        }
      }
    };

    fetchServices();
    fetchUserRequests();
  }, []);

  const handleRequestService = async (serviceId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to request a service.");
      return;
    }

    try {
      const serviceDoc = await getDoc(doc(db, "services", serviceId));
      const serviceData = serviceDoc.data();

      if (serviceData.userId === user.uid) {
        alert("You cannot request your own service.");
        return;
      }

      await addDoc(collection(db, "requests"), {
        serviceId,
        userId: user.uid,
        status: "pending",
        createdAt: new Date(), // Save the current date and time
      });

      alert("Service request submitted successfully!");
      setUserRequests((prevRequests) => [
        ...prevRequests,
        { serviceId, userId: user.uid, status: "pending", createdAt: new Date() },
      ]);
    } catch (error) {
      console.error("Error requesting service:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Available Services</h1>
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
              <p className="mt-2 text-sm text-gray-600">Added by: {service.user || "Unknown User"}</p>
              <button
                onClick={() => handleRequestService(service.id)}
                className="mt-4 w-full p-2 text-white bg-blue-500 rounded"
              >
                Request Service
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Your Requests</h2>
        {userRequests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRequests.map((request) => (
              <div key={request.id} className="p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-bold text-gray-900">
                  Service Name: {servicesMap[request.serviceId]?.name || "Unknown Service"}
                </h2>
                <p className="mt-2 text-lg font-semibold text-gray-800">Status: {request.status}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Requested At: {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : new Date(request.createdAt).toLocaleString()}
                </p>
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
