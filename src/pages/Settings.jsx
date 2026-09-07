import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  // =========================================
  // ACTIVE SECTION
  // =========================================

  const [activeSection, setActiveSection] =
    useState("profile");

  // =========================================
  // PROFILE
  // =========================================

  const [name, setName] = useState(
    localStorage.getItem("userName") ||
      "Kaushal Yadav"
  );

  const [email, setEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  // =========================================
  // NOTIFICATIONS
  // =========================================

  const [notifications, setNotifications] =
    useState(
      localStorage.getItem(
        "notificationEnabled"
      ) !== "false"
    );

  // =========================================
  // DARK MODE
  // =========================================

  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("darkMode") ===
        "true"
    );

  // =========================================
  // SECURITY
  // =========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [securityMessage, setSecurityMessage] =
    useState("");

  const [securityError, setSecurityError] =
    useState("");

  // =========================================
  // SAVE STATUS
  // =========================================

  const [saved, setSaved] = useState(false);

  // =========================================
  // APPLY DARK MODE
  // =========================================

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add(
        "app-dark"
      );
    } else {
      document.documentElement.classList.remove(
        "app-dark"
      );
    }

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );
  }, [darkMode]);

  // =========================================
  // SAVE SETTINGS
  // =========================================

  const saveSettings = () => {
    localStorage.setItem(
      "userName",
      name
    );

    localStorage.setItem(
      "userEmail",
      email
    );

    localStorage.setItem(
      "notificationEnabled",
      String(notifications)
    );

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );

    setSaved(true);

    // Tell other components that settings changed
    window.dispatchEvent(
      new Event("financeDataUpdated")
    );

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const changePassword = () => {
    setSecurityMessage("");
    setSecurityError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setSecurityError(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setSecurityError(
        "New password and confirm password do not match."
      );
      return;
    }

    /*
      This is for a localStorage-based project.

      If your project has a backend authentication
      system, password changing should be handled
      by your backend instead.
    */

    const storedPassword =
      localStorage.getItem("password");

    if (
      storedPassword &&
      storedPassword !== currentPassword
    ) {
      setSecurityError(
        "Current password is incorrect."
      );
      return;
    }

    localStorage.setItem(
      "password",
      newPassword
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setSecurityMessage(
      "Password changed successfully."
    );
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.removeItem("isLoggedIn");

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6">

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage your account and application
          preferences.
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

        {/* =====================================
            LEFT MENU
        ===================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl p-2 h-fit">

          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              setActiveSection("profile")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeSection === "profile"
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User size={18} />

            <span>
              Profile
            </span>
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            onClick={() =>
              setActiveSection(
                "notifications"
              )
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeSection === "notifications"
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Bell size={18} />

            <span>
              Notifications
            </span>
          </button>

          {/* APPEARANCE */}

          <button
            type="button"
            onClick={() =>
              setActiveSection(
                "appearance"
              )
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeSection === "appearance"
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Palette size={18} />

            <span>
              Appearance
            </span>
          </button>

          {/* SECURITY */}

          <button
            type="button"
            onClick={() =>
              setActiveSection("security")
            }
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeSection === "security"
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Shield size={18} />

            <span>
              Security
            </span>
          </button>

        </div>

        {/* =====================================
            RIGHT CONTENT
        ===================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6">

          {/* ===================================
              PROFILE
          =================================== */}

          {activeSection === "profile" && (

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Profile Settings
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-6">
                Update your personal information.
              </p>

              <div className="space-y-5">

                {/* NAME */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

              </div>

            </div>
          )}

          {/* ===================================
              NOTIFICATIONS
          =================================== */}

          {activeSection ===
            "notifications" && (

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Notification Settings
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-6">
                Control your application notifications.
              </p>

              <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50">

                <div>

                  <p className="font-medium text-slate-800">
                    Activity Notifications
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Get notified when income,
                    expenses or invoices are added.
                  </p>

                </div>

                {/* TOGGLE */}

                <button
                  type="button"
                  onClick={() =>
                    setNotifications(
                      (value) => !value
                    )
                  }
                  className={`w-14 h-7 rounded-full p-1 transition ${
                    notifications
                      ? "bg-orange-500"
                      : "bg-slate-300"
                  }`}
                  aria-label="Toggle notifications"
                >

                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      notifications
                        ? "translate-x-7"
                        : "translate-x-0"
                    }`}
                  />

                </button>

              </div>

            </div>
          )}

          {/* ===================================
              APPEARANCE
          =================================== */}

          {activeSection ===
            "appearance" && (

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Appearance
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-6">
                Customize how your dashboard looks.
              </p>

              {/* DARK MODE */}

              <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50">

                <div>

                  <p className="font-medium text-slate-800">
                    Dark Mode
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Use a darker appearance for the dashboard.
                  </p>

                </div>

                {/* DARK MODE SWITCH */}

                <button
                  type="button"
                  onClick={() =>
                    setDarkMode(
                      (value) => !value
                    )
                  }
                  className={`w-14 h-7 rounded-full p-1 transition ${
                    darkMode
                      ? "bg-orange-500"
                      : "bg-slate-300"
                  }`}
                  aria-label="Toggle dark mode"
                >

                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      darkMode
                        ? "translate-x-7"
                        : "translate-x-0"
                    }`}
                  />

                </button>

              </div>

            </div>
          )}

          {/* ===================================
              SECURITY
          =================================== */}

          {activeSection ===
            "security" && (

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Security
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-6">
                Protect your account and manage
                your password.
              </p>

              <div className="space-y-5">

                {/* CURRENT PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        currentPassword
                      }
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter current password"
                      className="w-full h-11 pl-11 pr-12 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* NEW PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="w-full h-11 pl-11 pr-12 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Password must contain at least
                    6 characters.
                  </p>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="w-full h-11 pl-11 pr-12 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {securityError && (

                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                    {securityError}
                  </div>

                )}

                {/* SUCCESS */}

                {securityMessage && (

                  <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-600">
                    {securityMessage}
                  </div>

                )}

                {/* CHANGE PASSWORD */}

                <button
                  type="button"
                  onClick={changePassword}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
                >
                  Change Password
                </button>

                {/* LOGOUT */}

                <div className="pt-5 mt-5 border-t border-slate-100">

                  <h3 className="font-medium text-slate-800">
                    Sign out
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Sign out from this account on
                    this device.
                  </p>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >

                    <LogOut size={17} />

                    Logout

                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ===================================
              SAVE BUTTON
          =================================== */}

          {activeSection !== "security" && (

            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">

              <button
                type="button"
                onClick={saveSettings}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
              >

                {saved ? (
                  <>
                    <Check size={18} />
                    Saved
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}