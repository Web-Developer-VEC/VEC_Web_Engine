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

function Carousel({ data }) {
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

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    // Ensure each event has unique id
    const withIds = data.map((event, i) => ({
      id: event.id || `db-${i}`,
      ...event,
    }));
    setEvents(withIds);
  }, [data]);

  const CARD_WIDTH = 465;
  const SCROLL_SPEED = 3;
  const SCROLL_INTERVAL = 16;

  const duplicatedEvents = [
    ...events,
    ...events,
    ...events,
    ...events,
    ...events,
  ];
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
    const parsed = new Date(dbDate);
    if (isNaN(parsed)) return "";
    return parsed.toISOString().split("T")[0];
  };

  const formatDateForDB = (inputDate, withYear = true) => {
    if (!inputDate) return "";
    const options = withYear
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { day: "2-digit", month: "short" };
    return new Date(inputDate)
      .toLocaleDateString("en-GB", options)
      .toUpperCase();
  };

  const handleDateChange = (id, field, value) => {
    const formatted =
      field === "end_date"
        ? formatDateForDB(value, true)
        : formatDateForDB(value, false);

    handleInputChange(id, field, formatted);
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      setOriginalEvents([...events]);
      setHasChanges(false);
      setIsEditMode(true);
    } else {
      if (hasChanges) {
        if (window.confirm("You have unsaved changes. Discard them?")) {
          setEvents([...originalEvents]);
          setSelectedEvents([]);
          setChanges([]);
          setHasChanges(false);
          setIsEditMode(false);
        }
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
    const updatedEvents = events.filter(
      (event) => !selectedEvents.includes(event.id)
    );
    const deletedEvents = events.filter((event) =>
      selectedEvents.includes(event.id)
    );

    const deleteChanges = deletedEvents.map((event) => ({
      action: "delete",
      id: event.id,
      title: event.title,
    }));

    setChanges([...changes, ...deleteChanges]);
    setEvents(updatedEvents);
    setSelectedEvents([]);
    setHasChanges(true);
    setDeleteConfirm(false);
  };

  const handleInputChange = (id, field, value) => {
    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, [field]: value } : event
    );
    setEvents(updatedEvents);

    const originalEvent = originalEvents.find((e) => e.id === id);
    if (originalEvent && originalEvent[field] !== value) {
      const existingChangeIndex = changes.findIndex(
        (change) => change.id === id && change.action === "update"
      );

      if (existingChangeIndex >= 0) {
        const updatedChanges = [...changes];
        updatedChanges[existingChangeIndex] = {
          ...updatedChanges[existingChangeIndex],
          [field]: value,
        };
        setChanges(updatedChanges);
      } else {
        setChanges([
          ...changes,
          {
            action: "update",
            id: id,
            title:
              field === "title" ? value : events.find((e) => e.id === id).title,
            [field]: value,
          },
        ]);
      }
    }

    setHasChanges(true);
  };

  const handleAddNewEvent = () => {
    const newEvent = {
      id: `new-${Date.now()}`,
      start_date: "",
      end_date: "",
      title: "",
      department: "",
      content: "",
      brochure_path: "",
      website_link: "",
      status: "True",
    };

    setEvents([newEvent, ...events]);
    setChanges([
      ...changes,
      {
        action: "insert",
        id: newEvent.id,
        title: "New Event",
      },
    ]);
    setHasChanges(true);
  };

  const handleFileChange = (id, file) => {
    if (!file) return;
    handleInputChange(id, "brochure_path", URL.createObjectURL(file));
  };

  const handleSaveChanges = () => {
    // Exit edit mode but keep reflection
    setIsEditMode(false);
    setHasChanges(true);
  };

  const handleFinalRequest = () => {
    console.log("Final request sent with changes:", changes);
    setShowConfirmPopup(false);
    setIsEditMode(false);
    setChanges([]);
    setSelectedEvents([]);
    setHasChanges(false);
  };

  return (
    <div className="relative">
      {!isEditMode && !hasChanges && (
        <button
          className="absolute -top-2 right-10 z-50 bg-secd dark:bg-drks p-2 rounded-[10px] shadow-md hover:bg-accn transition-colors flex items-center gap-1 text-text dark:text-drkt hover:text-prim"
          onClick={() => setIsEditMode(true)}
        >
          <Pencil size={20} /> Edit
        </button>
      )}

      {isEditMode ? (
        <div className="edit-mode-container p-4 bg-white dark:bg-drkd rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Events</h2>
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-drks"
              onClick={toggleEditMode}
            >
              <X size={20} />
            </button>
          </div>

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
                        onChange={(e) =>
                          handleFileChange(event.id, e.target.files[0])
                        }
                      />
                      <label
                        htmlFor={`file-${event.id}`}
                        className="p-2 bg-secd text-text rounded-[10px] hover:bg-brwn hover:text-prim text-[13px] cursor-pointer"
                      >
                        {event.brochure_path
                          ? "Change Brochure"
                          : "Upload Brochure"}
                      </label>
                      {event.brochure_path && (
                        <a
                          href={event.brochure_path}
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
            <button
              className="bg-secd text-text rounded-[10px] px-4 py-2 flex items-center gap-2"
              onClick={handleSaveChanges}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
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
              setEvents(data);
              setChanges([]);
              setHasChanges(false);
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
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied automatically
              to the live site.
            </p>
            <div className="max-h-[200px] overflow-y-auto mb-4">
              {changes.length > 0 ? (
                <table className="w-full text-left text-text dark:text-drkt">
                  <thead>
                    <tr>
                      <th className="py-1">Action</th>
                      <th className="py-1">Event</th>
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
              >
                Final Request
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