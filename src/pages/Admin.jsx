import { useEffect, useState } from "react";
import { getApplicants, updateApplicant, deleteApplicant } from "../services/api";

export default function Admin({ jobs = [], onAddJob, onUpdateJob, onDeleteJob }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [jobEditId, setJobEditId] = useState(null);
  const [jobEditName, setJobEditName] = useState("");
  const ADMIN_CREDENTIALS_KEY = "handa-careers-admin-credentials";
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminApplicants, setAdminApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminCredentials, setAdminCredentials] = useState({ username: "admin", password: "123456" });
  const [newAdminUsername, setNewAdminUsername] = useState("" );
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (stored) {
      try {
        setAdminCredentials(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse admin credentials", error);
      }
    } else {
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(adminCredentials));
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    setLoading(true);
    getApplicants()
      .then((data) => {
        setAdminApplicants(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load applicants", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loggedIn]);

  function login() {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      showNotification("تم تسجيل الدخول بنجاح", "success");
      setLoggedIn(true);
    } else {
      showNotification("بيانات الدخول غير صحيحة", "error");
    }
  }

  function showNotification(message, type = "success") {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "success" });
    }, 3000);
  }

  function saveCredentials() {
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      setSettingsMessage("يرجى إدخال اسم مستخدم وكلمة مرور جديدين.");
      return;
    }

    const updated = {
      username: newAdminUsername.trim(),
      password: newAdminPassword.trim(),
    };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(updated));
    setAdminCredentials(updated);
    setNewAdminUsername("");
    setNewAdminPassword("");
    setSettingsMessage("تم تحديث بيانات الدخول بنجاح.");
    showNotification("تم تحديث بيانات الدخول بنجاح", "success");
  }

  function logout() {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setAdminApplicants([]);
    setEditId(null);
    setEditData({});
  }

  function addJob() {
    const jobName = newJobName.trim();
    if (!jobName) return;
    if (jobs.includes(jobName)) {
      setSettingsMessage("هذه الوظيفة موجودة بالفعل.");
      return;
    }
    onAddJob?.(jobName);
    setNewJobName("");
    setSettingsMessage("تم إضافة الوظيفة بنجاح.");
  }

  function startJobEdit(index) {
    setJobEditId(index);
    setJobEditName(jobs[index]);
    setSettingsMessage("");
  }

  function saveJobEdit() {
    const jobName = jobEditName.trim();
    if (jobName && jobEditId !== null) {
      onUpdateJob?.(jobEditId, jobName);
      setJobEditId(null);
      setJobEditName("");
      setSettingsMessage("تم تحديث اسم الوظيفة.");
    }
  }

  function deleteJob(index) {
    if (!window.confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;
    onDeleteJob?.(index);
    setSettingsMessage("تم حذف الوظيفة.");
    showNotification("تم حذف الوظيفة بنجاح", "success");
  }

  function cancelJobEdit() {
    setJobEditId(null);
    setJobEditName("");
  }

  function startEdit(applicant) {
    setEditId(applicant.id);
    setEditData({
      name: applicant.name,
      phone: applicant.phone,
      address: applicant.address || "",
      nationalId: applicant.nationalId || "",
      job: applicant.job,
      status: applicant.status || "جديد",
      message: applicant.message || "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditData({});
  }

  function saveEdit() {
    updateApplicant(editId, editData)
      .then((updated) => {
        setAdminApplicants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setEditId(null);
        setEditData({});
        showNotification("تم حفظ التعديلات بنجاح", "success");
      })
      .catch((error) => {
        console.error("Failed to update applicant", error);
        showNotification("حدث خطأ أثناء تحديث البيانات", "error");
      });
  }

  function removeApplicant(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    deleteApplicant(id)
      .then(() => {
        setAdminApplicants((prev) => prev.filter((item) => item.id !== id));
        showNotification("تم حذف الطلب بنجاح", "success");
      })
      .catch((error) => {
        console.error("Failed to delete applicant", error);
        showNotification("حدث خطأ أثناء حذف البيانات", "error");
      });
  }

  function setEditField(name, value) {
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  function handleStatusChange(id, status) {
    const applicant = adminApplicants.find((item) => item.id === id);
    if (!applicant) return;
    updateApplicant(id, { ...applicant, status })
      .then((updated) => {
        setAdminApplicants((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showNotification(`تم تغيير الحالة إلى ${status}`, "success");
      })
      .catch((error) => {
        console.error("Failed to update applicant status", error);
        showNotification("حدث خطأ أثناء تحديث حالة الطلب", "error");
      });
  }

  function exportApplicants() {
    const rows = [
      [
        "الاسم",
        "رقم الهاتف",
        "الرقم القومي",
        "الوظيفة",
        "الحالة",
        "العنوان",
        "ملاحظات",
        "تاريخ التقديم",
        "الرقم التعريفي",
      ],
      ...filteredApplicants.map((applicant) => [
        applicant.name || "",
        applicant.phone || "",
        applicant.nationalId || "",
        applicant.job || "",
        applicant.status || "جديد",
        applicant.address || "",
        applicant.message || "",
        applicant.createdAt ? new Date(applicant.createdAt).toLocaleString() : "",
        applicant.id || "",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const filteredApplicants = adminApplicants.filter((applicant) => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const matchesText =
      !normalizedSearch ||
      [applicant.name, applicant.phone, applicant.nationalId, applicant.job]
        .some((field) => field?.toLowerCase().includes(normalizedSearch));

    const matchesJob = jobFilter === "all" || applicant.job === jobFilter;
    const matchesStatus =
      statusFilter === "all" || (applicant.status || "جديد") === statusFilter;

    return matchesText && matchesJob && matchesStatus;
  });

  const applicantJobs = Array.from(new Set(adminApplicants.map((item) => item.job).filter(Boolean)));

  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "380px",
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#0f766e",
            }}
          >
            Admin Login
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              color: "#000",
              display: "block",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              color: "#000",
              display: "block",
            }}
          />

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#0f766e" }}>لوحة تحكم المسؤول</h2>
            <p style={{ margin: "8px 0 0", color: "#475569" }}>
                عدد المتقدمين: {adminApplicants.length}
              </p>
            </div>

            <button
              onClick={logout}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              تسجيل خروج
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ابحث باسم، بريد، هاتف أو رقم قومي"
                style={{
                  flex: 1,
                  minWidth: "220px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                style={{
                  minWidth: "180px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                }}
              >
                <option value="all">كل الوظائف</option>
                {applicantJobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  minWidth: "180px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                }}
              >
                <option value="all">كل الحالات</option>
                <option value="جديد">جديد</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="مقبول">مقبول</option>
                <option value="مرفوض">مرفوض</option>
              </select>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <div style={{ color: "#475569" }}>
                تظهر الآن {filteredApplicants.length} طلبات بعد التصفية.
              </div>
              <button
                onClick={exportApplicants}
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#0f766e",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                تصدير البيانات
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <h3 style={{ margin: 0, color: "#0f766e", marginBottom: "14px" }}>
                إعدادات الدخول
              </h3>
              <p style={{ margin: "0 0 16px", color: "#475569" }}>
                المستخدم الحالي: <strong>{adminCredentials.username}</strong>
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                <input
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="اسم المستخدم الجديد"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="كلمة المرور الجديدة"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={saveCredentials}
                  style={{
                    width: "fit-content",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#0f766e",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  حفظ
                </button>
                {settingsMessage && (
                  <p style={{ color: "#0f766e", margin: 0 }}>{settingsMessage}</p>
                )}
                {notification.message && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      backgroundColor: notification.type === "success" ? "#dcfce7" : "#fee2e2",
                      color: notification.type === "success" ? "#166534" : "#b91c1c",
                      border: notification.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                    }}
                  >
                    {notification.message}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "18px",
                padding: "20px",
              }}
            >
              <h3 style={{ margin: 0, color: "#0f766e", marginBottom: "14px" }}>
                إدارة الوظائف
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <input
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    placeholder="اسم وظيفة جديد"
                    style={{
                      flex: 1,
                      minWidth: "220px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid #cbd5e1",
                      fontSize: "16px",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={addJob}
                    style={{
                      padding: "12px 18px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#0f766e",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    إضافة وظيفة
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <p style={{ margin: 0, color: "#475569" }}>
                    لا توجد وظائف حاليا. أضف وظيفة جديدة لظهورها في نموذج التقديم.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {jobs.map((job, index) => (
                      <div
                        key={job}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <span>{job}</span>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => startJobEdit(index)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid #0f766e",
                              backgroundColor: "#0f766e",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => deleteJob(index)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "10px",
                              border: "1px solid #ef4444",
                              backgroundColor: "#ef4444",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {jobEditId !== null && (
                  <div style={{ display: "grid", gap: "12px" }}>
                    <input
                      value={jobEditName}
                      onChange={(e) => setJobEditName(e.target.value)}
                      placeholder="اسم الوظيفة الجديد"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        onClick={saveJobEdit}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "12px",
                          border: "none",
                          backgroundColor: "#0f766e",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        حفظ التعديل
                      </button>
                      <button
                        onClick={cancelJobEdit}
                        style={{
                          padding: "12px 18px",
                          borderRadius: "12px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                padding: "28px",
                color: "#334155",
                textAlign: "center",
              }}
            >
              جاري جلب الطلبات...
            </div>
          ) : adminApplicants.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                padding: "28px",
                color: "#334155",
              }}
            >
              لا يوجد متقدمين حتى الآن.
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                padding: "28px",
                color: "#334155",
              }}
            >
              لا توجد طلبات مطابقة للفلاتر الحالية.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 8px 30px rgba(15, 118, 110, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: "#0f766e" }}>{applicant.name}</h3>
                      <p style={{ margin: "8px 0 0", color: "#475569" }}>
                        الوظيفة: {applicant.job}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", color: "#334155" }}>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        تم التقديم: {new Date(applicant.createdAt).toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: "14px" }}>ID: {applicant.id}</p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "18px",
                    }}
                  >
                    <div>
                    </div>
                    <div>
                      <strong>رقم الهاتف</strong>
                      <p style={{ margin: "8px 0 0", color: "#334155" }}>{applicant.phone}</p>
                    </div>
                    <div>
                      <strong>الرقم القومي</strong>
                      <p style={{ margin: "8px 0 0", color: "#334155" }}>
                        {applicant.nationalId || "غير متوفر"}
                      </p>
                    </div>
                    <div>
                      <strong>العنوان</strong>
                      <p style={{ margin: "8px 0 0", color: "#334155" }}>
                        {applicant.address || "غير متوفر"}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "18px",
                      marginTop: "18px",
                    }}
                  >
                    <div>
                      <strong>الحالة</strong>
                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "#fff",
                          display: "inline-block",
                          padding: "8px 12px",
                          borderRadius: "999px",
                          backgroundColor:
                            applicant.status === "مقبول"
                              ? "#22c55e"
                              : applicant.status === "مرفوض"
                              ? "#ef4444"
                              : applicant.status === "قيد المراجعة"
                              ? "#f59e0b"
                              : "#0f766e",
                        }}
                      >
                        {applicant.status || "جديد"}
                      </p>
                    </div>
                    <div>
                      <strong>ملاحظات</strong>
                      <p style={{ margin: "8px 0 0", color: "#334155" }}>
                        {applicant.message || "لا توجد ملاحظات"}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >
                    <button
                      onClick={() => handleStatusChange(applicant.id, "قيد المراجعة")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #f59e0b",
                        backgroundColor: "#f59e0b",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      قيد المراجعة
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant.id, "مقبول")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #22c55e",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant.id, "مرفوض")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #ef4444",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      رفض
                    </button>
                    <button
                      onClick={() => startEdit(applicant)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #0f766e",
                        backgroundColor: "#0f766e",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => removeApplicant(applicant.id)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #ef4444",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {editId && (
          <div
            style={{
              marginTop: "24px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 8px 30px rgba(15, 118, 110, 0.08)",
            }}
          >
            <h3 style={{ margin: 0, color: "#0f766e", marginBottom: "16px" }}>
              تعديل بيانات المتقدم
            </h3>
            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {[
                { label: "الاسم الكامل", name: "name" },
                { label: "رقم الهاتف", name: "phone" },
                { label: "العنوان", name: "address" },
                { label: "الرقم القومي", name: "nationalId" },
                { label: "الوظيفة", name: "job" },
                { label: "الحالة", name: "status", select: true },
                { label: "ملاحظات", name: "message", textarea: true },
              ].map((field) => (
                <label key={field.name} style={{ display: "block", color: "#334155" }}>
                  {field.label}
                  {field.textarea ? (
                    <textarea
                      value={editData[field.name] || ""}
                      onChange={(e) => setEditField(field.name, e.target.value)}
                      rows={4}
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                  ) : field.select ? (
                    <select
                      value={editData[field.name] || "جديد"}
                      onChange={(e) => setEditField(field.name, e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="جديد">جديد</option>
                      <option value="قيد المراجعة">قيد المراجعة</option>
                      <option value="مقبول">مقبول</option>
                      <option value="مرفوض">مرفوض</option>
                    </select>
                  ) : (
                    <input
                      value={editData[field.name] || ""}
                      onChange={(e) => setEditField(field.name, e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: "8px",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #d1d5db",
                        fontSize: "16px",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
            <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
              <button
                onClick={saveEdit}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#0f766e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                حفظ التعديلات
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#f8fafc",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

