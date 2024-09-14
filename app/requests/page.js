"use client";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState({}); // لتخزين تفاصيل الخدمة حسب المعرف
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestsAndServices = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // جلب الطلبات
        const requestsQuery = query(collection(db, "requests"), where("userId", "==", user.uid));
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // جلب التفاصيل الخاصة بالخدمات
        const servicesData = {};
        for (const request of requestsData) {
          const serviceRef = doc(db, "services", request.serviceId);
          const serviceSnap = await getDoc(serviceRef);
          if (serviceSnap.exists()) {
            servicesData[request.serviceId] = serviceSnap.data();
          }
        }

        setRequests(requestsData);
        setServices(servicesData);
      } catch (err) {
        console.error("Error fetching requests or services:", err);
        setError("فشل تحميل الطلبات. يرجى المحاولة مرة أخرى لاحقاً.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestsAndServices();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">طلباتك</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <div key={request.id} className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold text-gray-900">
              اسم الخدمة: {services[request.serviceId]?.name || "خدمة غير معروفة"}
            </h2>
            <p className="mt-2 text-lg font-semibold text-gray-800">الحالة: {request.status}</p>
            <p className="mt-2 text-sm text-gray-600">تاريخ الطلب: {new Date(request.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
