import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowDown, Pencil } from 'lucide-react';
import Lottie from 'react-lottie-player';
import './Tracker.css';
import { set } from 'date-fns';

const StatsGrid = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [request, setRequest] = useState(false)
  const statsRef = useRef(null);

  const [originalValues, setOriginalValues] = useState({
    teachers: 0,
    phdHolders: 0,
    students: 0,
    placement: 0,
  });

  const [editedValues, setEditedValues] = useState({
    teachers: 0,
    phdHolders: 0,
    students: 0,
    placement: 0,
  });

  const [targetValues, setTargetValues] = useState({
    teachers: 0,
    phdHolders: 0,
    students: 0,
    placement: 0,
  });

  const [counters, setCounters] = useState({
    teachers: 0,
    phdHolders: 0,
    students: 0,
    placement: 0,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const newValues = {
        teachers: parseInt(data[0]?.Active_Learners) || 0,
        phdHolders: parseInt(
          data[0]?.Highest_Salary_Offered?.replace(' INR', '')
        ) || 0,
        students:
          parseInt(data[0]?.Hiring_Partners?.replace('+', '')) || 0,
        placement:
          parseInt(data[0]?.Average_Salary_Hike?.replace('%', '')) ||
          0,
      };

      setTargetValues(newValues);
      setOriginalValues(newValues);
      setEditedValues(newValues);
    }
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !isEditing) {
      const animateCounters = () => {
        setCounters(prevCounters => {
          const newCounters = { ...prevCounters };
          Object.keys(targetValues).forEach(key => {
            if (newCounters[key] < targetValues[key]) {
              newCounters[key] += Math.ceil(targetValues[key] / 95);
              if (newCounters[key] > targetValues[key]) {
                newCounters[key] = targetValues[key];
              }
            }
          });
          return newCounters;
        });
      };

      const interval = setInterval(animateCounters, 30);

      return () => clearInterval(interval);
    }
  }, [isVisible, isEditing, targetValues]);

  // --- Handlers ---
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedValues(targetValues);
    setRequest(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedValues(targetValues); // reset to last saved
  };

  const handleSaveClick = () => {
    setIsEditing(false); // exit edit mode
    setTargetValues(editedValues); // save new values
    setRequest(true);
  };

  const handleDiscardClick = () => {
    // FIX: Reset to the original database values, not the last saved values
    setEditedValues(originalValues);
    setTargetValues(originalValues);
    setRequest(false);
    setIsEditing(false);
  };

  const handleRequestClick = () => {
    setConfirmPopup(true);
  };

  const handleConfirmRequest = () => {
    // send request to backend if needed
    setConfirmPopup(false);
    setOriginalValues(editedValues); // now original = approved
  };

  const handleInputChange = (key, value) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStatValue = key => {
    if (isEditing) {
      return (
        <input
          type="number"
          value={editedValues[key]}
          onChange={e =>
            handleInputChange(key, parseInt(e.target.value) || 0)
          }
          className="stat-input text-text bg-gry border-b border-white text-white text-center w-24"
        />
      );
    } else {
      return (
        <h2 className="stat-number">
          {editedValues[key]}
          {key === 'phdHolders' ? ' INR' : ''}
          {key === 'students' ? '+' : ''}
          {key === 'placement' ? '%' : ''}
        </h2>
      );
    }
  };

  const hasChanges = Object.keys(editedValues).some(
    key => editedValues[key] !== targetValues[key]
  );

  return (
    <div className="page-container justify-start text-white font-popp bg-black/30 backdrop-blur-[4px] relative">
      {/* Edit Button (Top Right) */}
      {!isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-12 flex gap-2 p-2 bg-secd text-text rounded-[10px] transition-colors"
        >
          <Pencil size={20} /> Edit
        </button>
      )}

      <div className="stats-grid-container mt-[5%]">
        <div
          className="stats-grid flex-wrap sm:gap-4 lg:gap-[10rem] h-fit rounded-lg lg:justify-between"
          ref={statsRef}
        >
          <div className="stat-item basis-1/2 lg:basis-1/4 lg:px-2">
            <Lottie
              className="mx-auto"
              loop
              animationData={require('../../Assets/Active Learners.json')}
              play={!isEditing}
              style={{ width: 140, height: 185 }}
            />
            {renderStatValue('teachers')}
            <p className="stat-label">Active Learners</p>
          </div>
          <div className="stat-item basis-1/2 lg:basis-1/4">
            <Lottie
              className="mx-auto"
              loop
              animationData={require('../../Assets/hike.json')}
              play={!isEditing}
              style={{ width: 140, height: 192 }}
            />
            {renderStatValue('phdHolders')}
            <p className="stat-label">Highest Salary Offered (LPA)</p>
          </div>
          <div className="basis-full lg:hidden"></div>
          <div className="stat-item basis-1/2 lg:basis-1/4">
            <Lottie
              className="mx-auto"
              loop
              animationData={require('../../Assets/Hiring Partners.json')}
              play={!isEditing}
              style={{ width: 140, height: 192 }}
            />
            {renderStatValue('students')}
            <p className="stat-label">Hiring Partners</p>
          </div>
          <div className="stat-item basis-1/2 lg:basis-1/4">
            <Lottie
              className="mx-auto"
              loop
              animationData={require('../../Assets/salary.json')}
              play={!isEditing}
              style={{ width: 140, height: 210 }}
            />
            {renderStatValue('placement')}
            <p className="stat-label">Average Salary Hike</p>
          </div>
        </div>
      </div>

      {/* --- Action Buttons (Bottom Right) --- */}
      {isEditing && !hasChanges && (
        <div className="fixed -bottom-2 right-4 flex gap-2 p-4 shadow-lg">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 rounded bg-gray-600 text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {isEditing && hasChanges && (
        <div className="fixed -bottom-2 right-4 flex gap-2 p-4 shadow-lg">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 rounded bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        </div>
      )}

      {request && (
        <div className="fixed -bottom-2 right-4 flex gap-2 p-4 shadow-lg">
          <button
            onClick={handleDiscardClick}
            className="px-4 py-2 rounded bg-gray-600 text-white"
          >
            Discard Changes
          </button>
          <button
            onClick={handleRequestClick}
            className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn hover:text-prim"
          >
            Request
          </button>
        </div>
      )}

      {/* --- Confirmation Popup --- */}
      {confirmPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
            <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
              Final Request for the Changes
            </h2>

            <p className="text-sm text-red-500 mb-4">
              Note: Your changes will stay pending until approved by the
              superior admin. Once approved, they will be applied
              automatically to the live site.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4">
              <table className="w-full text-left text-text dark:text-drkt">
                <thead>
                  <tr>
                    <th className="py-1">Stat</th>
                    <th className="py-1">Old Value</th>
                    <th className="py-1">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(originalValues).map(
                    key =>
                      originalValues[key] !== editedValues[key] && (
                        <tr key={key}>
                          <td className="py-1 text-blue-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </td>
                          <td className="py-1">
                            {originalValues[key]}
                            {key === 'phdHolders' ? ' INR' : ''}
                            {key === 'students' ? '+' : ''}
                            {key === 'placement' ? '%' : ''}
                          </td>
                          <td className="py-1 flex items-center">
                            <ArrowDown size={16} className="mx-1" />
                            {editedValues[key]}
                            {key === 'phdHolders' ? ' INR' : ''}
                            {key === 'students' ? '+' : ''}
                            {key === 'placement' ? '%' : ''}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPopup(false)}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="px-4 py-2 rounded bg-secd dark:drks hover:bg-[#800000] text-text hover:text-drkt"
              >
                Final Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;