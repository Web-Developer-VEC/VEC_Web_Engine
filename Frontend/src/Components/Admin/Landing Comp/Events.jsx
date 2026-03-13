import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  Pencil,
  Eye,
} from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "framer-motion";
import "./Events.css";
import { ToastContainer, toast } from "react-toastify"; // fixed import name
import "react-toastify/dist/ReactToastify.css";
import { useAdminRequest } from "../../hooks/useAdminRequest";

/* --- EventBox unchanged --- */
function EventBox({ event, onMouseEnter, onMouseLeave }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <motion.div
      className="caro-item text-lg"
      whileHover={{ scale: 1.1, zIndex: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={onMouseEnter}
      onHoverEnd={onMouseLeave}
    >
      <motion.div
        className="event-box bg-secd dark:bg-drks text-prim"
        whileHover={{ boxShadow: "1px 1px 1px rgba(0, 0, 0, 0.15)" }}
      >
        <div className="event-header">
          <div className="event-date">
            <div className="circle bg-accn text-prim dark:text-drkt border-8 border-prim dark:border-drkp">
              {event.start_date}
            </div>
          </div>
          <div className="event-name line-clamp-2 text-2xl">
            {event.title}
          </div>
        </div>
        <div className="event-details text-text dark:text-drkt">
          <div className="event-row department-name bg-prim dark:bg-drkp text-xl">
            {event.department}
          </div>
          <div className="event-row description text-md/2 line-clamp-2">
            {event.content}
          </div>
          <div className="event-footer">
            <div className="event-row text-accn duration font-semibold">
              <i className="fas fa-calendar-alt"></i>{" "}
              {event.start_date + " - " + event.end_date}
            </div>
            <div className="event-row links">
              {event.brochure_path && (
                <a
                  href={UrlParser(event.brochure_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-drka"
                >
                  Brochure
                </a>
              )}
              {event.website_link && (
                <a
                  href={UrlParser(event.website_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-drka"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Carousel component: updated --- */
function Carousel({ data }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
    const UrlParser = (path) => {
    return path?.startsWith("http") ? path : `${BASE_URL}${path}`;
  };
  const x = useMotionValue(0);
  const lastScrollTime = useRef(Date.now());
  const isHovered = useRef(false);

  const [events, setEvents] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [changes, setChanges] = useState([]);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedEvents, setLastSavedEvents] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { sendRequest, loading: requestLoading, error: requestError } = useAdminRequest();
console.log(data);

  

useEffect(() => {
  const withIds = data.map((event, i) => {
    let isoDate = "";

    // Convert formatted date like "05 JUL 2026" → ISO
    if (event.date) {
      isoDate = event.date;
    } else if (event.start_date) {
      const parsed = new Date(event.start_date);
      if (!isNaN(parsed)) {
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, "0");
        const dd = String(parsed.getDate()).padStart(2, "0");
        isoDate = `${yyyy}-${mm}-${dd}`;
      }
    }

    return {
      id: event.id || `db-${i}`,
      date: isoDate, // ✅ always ISO
      start_date: event.start_date || "",
      end_date: event.end_date || "",
      brochure_path: event.brochure_path || "",
      _file: null,
      ...event,
    };
  });

  setEvents(withIds);
  setOriginalEvents(withIds);
  setLastSavedEvents(withIds);
}, [data]);


  useEffect(() => {
  setHasChanges(changes.length > 0);
}, [changes]);




  const CARD_WIDTH = 465;
  const SCROLL_SPEED = 3;
  const SCROLL_INTERVAL = 16;

  const duplicatedEvents = [...events, ...events, ...events, ...events, ...events];
  const TOTAL_WIDTH = duplicatedEvents.length * CARD_WIDTH;

  const wrappedX = useTransform(x, (value) => {
    const range = TOTAL_WIDTH;
    const wrapped = ((value % range) + range) % range;
    return -wrapped;
  });


  
  useAnimationFrame(() => {
    if (!isHovered.current && !isEditMode) {
      const now = Date.now();
      if (now - lastScrollTime.current >= SCROLL_INTERVAL) {
        const currentX = x.get();
        const newX = currentX + SCROLL_SPEED;

        if (newX >= TOTAL_WIDTH / 3) {
          x.set(0);
        } else {
          x.set(newX);
        }

        lastScrollTime.current = now;
      }
    }
  });

  const handleHoverStart = () => {
    isHovered.current = true;
  };

  const handleHoverEnd = () => {
    isHovered.current = false;
  };

  // Helpers
const formatDateForInput = (dbDate) => {
  if (!dbDate) return "";

  const parts = dbDate.split(" ");
  if (parts.length > 0) {
    const parsed = new Date(parts.join(" "));
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
};

const formatDateForDB = (inputDate, withYear = true) => {
  if (!inputDate) return "";

  const [year, month, day] = inputDate.split("-");
  const date = new Date(year, month - 1, day);

  const options = withYear
    ? { day: "2-digit", month: "short", year: "numeric" }
    : { day: "2-digit", month: "short" };

  return date.toLocaleDateString("en-GB", options).toUpperCase();
};

  // IMPORTANT: when user selects date input we store both the display (e.g. "16 JUL") AND the ISO date (YYYY-MM-DD)
const handleDateChange = (id, field, value) => {
  if (!value) return;

  // value is already YYYY-MM-DD (safe)
  const dateObj = new Date(value);

  const displayDate =
    field === "end_date"
      ? dateObj
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase()
      : dateObj
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
          .toUpperCase();

  const updatedEvents = events.map((ev) => {
    if (ev.id !== id) return ev;

    return {
      ...ev,
      [field]: displayDate,
      date: field === "start_date" ? value : ev.date, // ✅ store ISO safely
    };
  });

  setEvents(updatedEvents);

  handleInputChange(id, field, displayDate, {
    rawDateIso: field === "start_date" ? value : undefined,
  });
};
  const toggleEditMode = () => {
    if (!isEditMode) {
            setIsEditMode(true);
    } else {
      if (hasChanges) {
        // if (window.confirm("You have unsaved changes. Discard them?")) {
          setEvents([...lastSavedEvents]);
          setIsEditMode(false);
          setSelectedEvents([]);
          // setChanges([]);
          
          setIsEditMode(false);
        // }
      } else {
        setIsEditMode(false);
      }
    }
  };

  const handleSelectEvent = (id) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter((eventId) => eventId !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const confirmDelete = () => {
    setDeleteConfirm(true);
  };

  const handleDeleteConfirmed = () => {
    const updatedEvents = events.filter((event) => !selectedEvents.includes(event.id));
    const deletedEvents = events.filter((event) => selectedEvents.includes(event.id));

setChanges((prevChanges) => {
  let updatedChanges = [...prevChanges];

  deletedEvents.forEach((event) => {
    // 🔥 Remove any previous update for this event
    updatedChanges = updatedChanges.filter(
      (c) => !(c.id === event.id && c.action === "update")
    );

    const existingInsertIndex = updatedChanges.findIndex(
      (c) => c.id === event.id && c.action === "insert"
    );

    if (existingInsertIndex !== -1) {
      // If newly inserted then deleted → remove both
      updatedChanges.splice(existingInsertIndex, 1);
    } else {
      updatedChanges.push({
        action: "delete",
        id: event.id,
        title: event.title,
        meta: { ...event },
      });
    }
  });

  return updatedChanges;
});
    // setChanges((prev) => [...prev, ...deleteChanges]);
    setEvents(updatedEvents);
    setSelectedEvents([]);
    // setHasChanges(true);
    setDeleteConfirm(false);
  };

  

  /**
   * handleInputChange
   * - id: event id
   * - field: property name
   * - value: new value
   * - opts: optional { rawDateIso } if we have underlying ISO date
   */
  const handleInputChange = (id, field, value, opts = {}) => {
    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, [field]: value, ...(opts.rawDateIso ? { date: opts.rawDateIso } : {}) } : event
    );
    setEvents(updatedEvents);

    const originalEvent = originalEvents.find((e) => e.id === id);
    // if originalEvent doesn't exist, it's an insert (new id), record insert (or update existing insert)
    if (!originalEvent) {
      // if already have an insert change for this id, update its title
      const existingInsertIndex = changes.findIndex((c) => c.id === id && c.action === "insert");
      if (existingInsertIndex >= 0) {
        const updated = [...changes];
        updated[existingInsertIndex] = { ...updated[existingInsertIndex], [field]: value, title: updated[existingInsertIndex].title || value };
        setChanges(updated);
      } else {
        setChanges((prev) => [...prev, { action: "insert", id, title: value || "New Event" }]);
      }
      // setHasChanges(true);
      return;
    }
const existingChangeIndex = changes.findIndex(
  (c) => c.id === id && c.action === "update"
);

    // If value is different from original, add/update an "update" change entry
if (originalEvent[field] !== value) {
  // Value is different → create/update change
  if (existingChangeIndex >= 0) {
    const updatedChanges = [...changes];
    updatedChanges[existingChangeIndex] = {
      ...updatedChanges[existingChangeIndex],
      [field]: value,
      title:
        updatedChanges[existingChangeIndex].title ||
        (field === "title" ? value : eventTitleById(id)),
    };
    setChanges(updatedChanges);
  } else {
    setChanges((prev) => [
      ...prev,
      {
        action: "update",
        id,
        title: field === "title" ? value : eventTitleById(id),
        [field]: value,
      },
    ]);
  }
} else {
  // 🔥 Value returned to original → remove that field change
  if (existingChangeIndex >= 0) {
    const updatedChanges = [...changes];
    const changeItem = { ...updatedChanges[existingChangeIndex] };

    delete changeItem[field];

    // Check if only id, action, title remain → remove whole update
    const keys = Object.keys(changeItem);
    if (
      keys.length <= 3 // action, id, title
    ) {
      updatedChanges.splice(existingChangeIndex, 1);
    } else {
      updatedChanges[existingChangeIndex] = changeItem;
    }

    setChanges(updatedChanges);
  }
}
  };

  const eventTitleById = (id) => {
    const ev = events.find((e) => e.id === id);
    return ev ? ev.title : "Event";
  };

  const handleAddNewEvent = () => {
    const newEvent = {
      id: `new-${Date.now()}`,
      start_date: "",
      end_date: "",
      date: "", // iso date
      title: "",
      department: "",
      content: "",
      brochure_path: "",
      website_link: "",
      status: "True",
      _file: null,
    };

    setEvents([newEvent, ...events]);
    setChanges((prev) => [
      ...prev,
      {
        action: "insert",
        id: newEvent.id,
        title: "New Event",
      },
    ]);
    // setHasChanges(true);
    setIsEditMode(true);
  };

  // Now store file object on the event as _file and preview url in brochure_path
  const handleFileChange = (id, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const updatedEvents = events.map((ev) => (ev.id === id ? { ...ev, brochure_path: previewUrl, _file: file } : ev));
    setEvents(updatedEvents);

    // mark change: if original existed, mark update; else insert remains
    const originalEvent = originalEvents.find((e) => e.id === id);
    if (originalEvent) {
      const existingChangeIndex = changes.findIndex((c) => c.id === id && c.action === "update");
      if (existingChangeIndex >= 0) {
        const updated = [...changes];
        updated[existingChangeIndex] = { ...updated[existingChangeIndex], brochure_path: previewUrl };
        setChanges(updated);
      } else {
        setChanges((prev) => [
          ...prev,
          {
            action: "update",
            id,
            title: eventTitleById(id),
            brochure_path: previewUrl,
          },
        ]);
      }
    }
    // setHasChanges(true);
  };

const handleSaveChanges = () => {
  setLastSavedEvents(events.map(e => ({ ...e }))); // ✅ snapshot
  setIsEditMode(false);
  // toast.info("Changes saved locally. Submit request to apply them.");
};

  const buildPayloadsFromChanges = () => {
    const payloads = [];
    const filesToSend = [];

    for (const ch of changes) {
      if (ch.action === "insert") {
        // find the event in current events
        const ev = events.find((e) => e.id === ch.id);
        if (!ev) continue;
        const imagePath = ev.brochure_path && ev._file ? `/static/images/events/${ev._file.name}` : ev.brochure_path || "";
        if (ev._file) filesToSend.push(ev._file);

        payloads.push({
          collectionName: "landing_page_details",
          collection_type: "events",
          action: "insert",
          title: "insert in events",
          meta_data: {
            start_date: ev.start_date || "",
            end_date: ev.end_date || "",
            date: ev.date || "", // ISO yyyy-mm-dd
            title: ev.title || "",
            department: ev.department || "",
            content: ev.content || "",
            image_path: imagePath,
            website_link: ev.website_link || "",
            status: ev.status || "True",
          },
        });
      } else if (ch.action === "update") {
        // find current event and original event
        const ev = events.find((e) => e.id === ch.id);
        const orig = originalEvents.find((e) => e.id === ch.id) || {};
        if (!ev) continue;
        const imagePath = ev.brochure_path && ev._file ? `/static/images/events/${ev._file.name}` : ev.brochure_path || "";
        if (ev._file) filesToSend.push(ev._file);

        payloads.push({
          collectionName: "landing_page_details",
          collection_type: "events",
          action: "update",
          title: "update in events",
          original_data: {
            start_date: orig.start_date || "",
            end_date: orig.end_date || "",
            date: orig.date || "",
            title: orig.title || "",
            department: orig.department || "",
            content: orig.content || "",
            image_path: orig.brochure_path || "",
            website_link: orig.website_link || "",
            status: orig.status || "True",
          },
          meta_data: {
            start_date: ev.start_date || "",
            end_date: ev.end_date || "",
            date: ev.date || "",
            title: ev.title || "",
            department: ev.department || "",
            content: ev.content || "",
            image_path: imagePath,
            website_link: ev.website_link || "",
            status: ev.status || "True",
          },
        });
      } else if (ch.action === "delete") {
        // ch.meta should hold the snapshot we saved earlier
        const snapshot = ch.meta || originalEvents.find((e) => e.id === ch.id) || {};
        payloads.push({
          collectionName: "landing_page_details",
          collection_type: "events",
          action: "delete",
          title: "delete in events",
          meta_data: {
            start_date: snapshot.start_date || "",
            end_date: snapshot.end_date || "",
            date: snapshot.date || "",
            title: snapshot.title || "",
            department: snapshot.department || "",
            content: snapshot.content || "",
            image_path: snapshot.brochure_path || "",
            website_link: snapshot.website_link || "",
            status: snapshot.status || "True",
          },
        });
      }
    }

    return { payloads, filesToSend };
  };

  // Async submit final request
  const handleFinalRequest = async () => {
    if (!changes || changes.length === 0) {
      toast.info("No changes to submit.");
      setShowConfirmPopup(false);
      return;
    }
    const { payloads, filesToSend } = buildPayloadsFromChanges();

    try {
      const result = await sendRequest(payloads, filesToSend); // expects your hook to handle formdata / files
      if (result) {
        // on success: commit current events as originalEvents, clear changes
        setOriginalEvents(events.map((e) => ({ ...e, brochure_path: e.brochure_path })));
        setChanges([]);
        
        setSelectedEvents([]);
        setShowConfirmPopup(false);
        // toast.success("Final request submitted!");
      } else {
        toast.error("Request failed.");
      }
    } catch (err) {
      console.error("Final request error:", err);
      toast.error("An error occurred while sending request.");
    }
  };

  const revertChange = (changeItem) => {
  const { id, action } = changeItem;

  if (action === "insert") {
    // Remove newly added event
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }

  if (action === "update") {
    // Restore original event values
    const originalEvent = originalEvents.find((e) => e.id === id);
    if (originalEvent) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...originalEvent } : event
        )
      );
    }
  }

  if (action === "delete") {
    // Restore deleted event
    const deletedSnapshot = changeItem.meta;
    if (deletedSnapshot) {
      setEvents((prev) => [...prev, deletedSnapshot]);
    }
  }

  // Remove this change entry
  setChanges((prev) =>
    prev.filter((c) => !(c.id === id && c.action === action))
  );

  // If no more changes → disable request buttons
  if (changes.length === 1) {
    
  }
};

  return (
    <div className="relative">
      <ToastContainer position="bottom-right" autoClose={2000} />
      {!isEditMode &&(
        <button
          className="absolute -top-2 right-10 z-50 bg-secd dark:bg-drks p-2 rounded-[10px] shadow-md hover:bg-accn transition-colors flex items-center gap-1 text-text dark:text-drkt hover:text-prim"
          onClick={() => setIsEditMode(true)}
        >
          <Pencil size={20} /> Edit
        </button>
      )}

      {isEditMode ? (
        /* --- edit mode (unchanged except file input id and onChange uses handleFileChange) --- */
        <div className="edit-mode-container p-4 bg-white dark:bg-drkd rounded-lg shadow-lg">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-100 dark:bg-drkp z-10">
                <tr>
                  <th className="p-2 border">S.No</th>
                  <th className="p-2 border">Start Date</th>
                  <th className="p-2 border">End Date</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Department</th>
                  <th className="p-2 border">Content</th>
                  <th className="p-2 border">Brochure</th>
                  <th className="p-2 border">Website Link</th>
                  <th className="p-2 border">
                    <input
                      type="checkbox"
                      checked={
                        selectedEvents.length === events.length &&
                        events.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents(events.map((event) => event.id));
                        } else {
                          setSelectedEvents([]);
                        }
                      }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <tr
                    key={event.id}
                    className="border-b hover:bg-gray-50 dark:hover:bg-drks"
                  >
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border">
<input
  type="date"
  value={formatDateForInput(event.start_date)}
  onChange={(e) =>
    handleDateChange(event.id, "start_date", e.target.value)
  }
  className="w-full p-1 border rounded"
/>
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={formatDateForInput(event.end_date)}
                        onChange={(e) =>
                          handleDateChange(event.id, "end_date", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) =>
                          handleInputChange(event.id, "title", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={event.department}
                        onChange={(e) =>
                          handleInputChange(event.id, "department", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <textarea
                        value={event.content}
                        onChange={(e) =>
                          handleInputChange(event.id, "content", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    </td>
                    <td className="p-2 border flex gap-2 items-center justify-center">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: "none" }}
                        id={`file-${event.id}`}
                        onChange={(e) => handleFileChange(event.id, e.target.files[0])}
                      />
                      <label
                        htmlFor={`file-${event.id}`}
                        className="p-2 bg-secd text-text rounded-[10px] hover:bg-brwn hover:text-prim text-[13px] cursor-pointer"
                      >
                        {event.brochure_path ? "Change Brochure" : "Upload Brochure"}
                      </label>
                    {event.brochure_path && (
                      <a
                        href={
                          event.brochure_path.startsWith("blob:") ||
                          event.brochure_path.startsWith("http")
                            ? event.brochure_path
                            : UrlParser(event.brochure_path)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm"
                      >
                        <Eye className="text-secd" />
                      </a>
                    )}
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={event.website_link || ""}
                        onChange={(e) =>
                          handleInputChange(
                            event.id,
                            "website_link",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleSelectEvent(event.id)}
                        className="cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 justify-center mt-4">
            <button
              className="bg-secd text-text rounded-[10px] px-4 py-2 flex items-center gap-2"
              onClick={handleAddNewEvent}
            >
              <Plus size={16} /> Add New Event
            </button>
            {selectedEvents.length > 0 && (
              <button
                className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={confirmDelete}
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            )}
          </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={toggleEditMode}
          >
            Cancel
          </button>

          {hasChanges && (
            <button
              className="bg-secd text-text rounded-[10px] px-4 py-2 flex items-center gap-2"
              onClick={handleSaveChanges}
            >
              <Save size={16} /> Save
            </button>
          )}
        </div>
        </div>
      ) : (
        /* --- Carousel view unchanged --- */
        <div className="event-carousel-wrapper">
          <div className="nav-button-area-ann z-[500] left">
            <motion.button
              className="nav-button-ann"
              onClick={() => x.set(x.get() - CARD_WIDTH)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="nav-icon" />
            </motion.button>
          </div>
          <div className="caro-container font-popp">
            <motion.div
              className="caro-content md:gap-8 text-xl"
              style={{ x: wrappedX }}
            >
              {duplicatedEvents.map((event, index) => (
                <div
                  draggable={true}
                  onClick={handleHoverStart}
                  onMouseLeave={handleHoverEnd}
                  key={index}
                >
                  <EventBox
                    event={event}
                    onMouseEnter={handleHoverStart}
                    onMouseLeave={handleHoverEnd}
                  />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="nav-button-area-ann right">
            <motion.button
              className="nav-button-ann"
              onClick={() => x.set(x.get() + CARD_WIDTH)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="nav-icon" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Discard + Request buttons */}
      {!isEditMode && hasChanges && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              setEvents(originalEvents.map((e) => ({ ...e })));
              setChanges([]);
              
              toast.info("Changes discarded.");
            }}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            Discard Changes
          </button>
          <button
            onClick={() => setShowConfirmPopup(true)}
            className="px-4 py-2 rounded bg-secd dark:bg-drks text-text hover:bg-[#800000]"
          >
            Request Changes
          </button>
        </div>
      )}

      {/* Request confirm popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the superior admin. Once approved, they will be applied automatically to the live site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {changes.length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Event</th>
                      <th className="py-1">Revert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change, i) => (
                    <tr key={i}>
                      <td className="py-1">
                        {change.action === "delete" && (
                          <span className="text-red-600 flex items-center gap-1">
                            <Trash2 size={14} /> Delete
                          </span>
                        )}
                        {change.action === "update" && (
                          <span className="text-blue-600 flex items-center gap-1">
                            Edit
                          </span>
                        )}
                        {change.action === "insert" && (
                          <span className="text-green-600 flex items-center gap-1">
                            + Added
                          </span>
                        )}
                      </td>

                      <td className="py-1">{change.title}</td>

                      <td className="py-1 text-center">
                        <button
                          onClick={() => revertChange(change)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-drks"
                          title="Undo this change"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No changes found.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalRequest}
                className="px-4 py-2 rounded bg-secd dark:bg-drks hover:bg-[#800000] text-text hover:text-drkt"
                disabled={requestLoading}
              >
                {requestLoading ? "Processing..." : "Final Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] pointer-events-auto">
          <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4 text-text dark:text-drkt">
              Confirm Delete
            </h2>
            <p className="text-sm text-red-500 mb-4">
              Are you sure you want to delete the selected events?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carousel;