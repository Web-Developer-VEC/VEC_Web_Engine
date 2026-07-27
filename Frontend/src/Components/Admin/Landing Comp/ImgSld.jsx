import React, { useEffect, useRef, useState } from 'react';

import College from '../../Assets/Hell.png';
import Toggle from "../Toggle";
import { ArrowDown, Pencil, Plus, Trash2 } from 'lucide-react';

const ImgSld = ({ load, toggle, theme, lst, ph, email }) => {
    const videoRef = useRef(null);

    // Debounce
    const debounce = (func, wait = 100) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const hndlScrll = debounce(() => {
        const pos = window.scrollY;
        const pos_thresh = 600;

        if (pos > pos_thresh) {
            if (videoRef.current) videoRef.current.pause();
        } else {
            if (videoRef.current) videoRef.current.play();
        }
    }, 100);

    // STATE
    const [isEditing, setIsEditing] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [editableData, setEditableData] = useState({
        phone: ph,
        email: email,
        notifications: lst || [],
    });
    const [currentNotifIndex, setCurrentNotifIndex] = useState(0);

    const initialDataRef = useRef({ phone: ph, email: email, notifications: lst });

    const [displayItems, setDisplayItems] = useState([]);

    const pickRandom7 = () => {
        if (!lst || lst.length <= 7) return lst || [];
        const shuffled = [...lst].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 7);
    };

    // EFFECT HOOKS
    useEffect(() => {
        initialDataRef.current = { phone: ph, email: email, notifications: lst || [] };
        setEditableData(initialDataRef.current);
    }, [ph, email, lst]);

    useEffect(() => {
        window.addEventListener('scroll', hndlScrll, { passive: true });
        const video = videoRef.current;
        const handleCanPlayThrough = () => {
            load();
        };
        if (video) {
            video.addEventListener('canplaythrough', handleCanPlayThrough);
        }
        return () => {
            if (video) {
                video.removeEventListener('canplaythrough', handleCanPlayThrough);
            }
            window.removeEventListener('scroll', hndlScrll);
        };
    }, [hndlScrll, load]);

    useEffect(() => {
        if (!isEditing) {
            const initialPick = pickRandom7();
            setDisplayItems(initialPick);

            const interval = setInterval(() => {
                setDisplayItems(pickRandom7());
            }, 50000);
            return () => clearInterval(interval);
        }
    }, [isEditing, lst]);

    // Disable wheel scroll on specific elements
    const disableWheelScroll = useRef(null);
    useEffect(() => {
        const container = disableWheelScroll.current;
        if (!container) return;
        const onWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    const toggleRef = useRef(null);
    useEffect(() => {
        const toggleEl = toggleRef.current;
        if (!toggleEl) return;
        const handleWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        toggleEl.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            toggleEl.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // EDITING HANDLERS
    const handleEditClick = () => {
        setIsEditing(true);
        setFinalizing(false);
    };

    const handleSave = () => {
        setIsEditing(false);
        setFinalizing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFinalizing(false);
        setEditableData(initialDataRef.current);
    };

    const handleDiscardChanges = () => {
        setEditableData(initialDataRef.current);
        setFinalizing(false);
    };

    // ---------- Request Popup ----------
    const [confirmPopup, setConfirmPopup] = useState(false);

    const handleRequest = () => {
        setConfirmPopup(true);
    };

    const handleConfirmRequest = () => {
        alert("Final request submitted!");
        setConfirmPopup(false);
        setFinalizing(false);
    };

    // ---------- Notification Modal ----------
    const [notifModalOpen, setNotifModalOpen] = useState(false);
    const [modalNotifications, setModalNotifications] = useState([]);
    const [modalSelected, setModalSelected] = useState({});
    const [modalSelectAll, setModalSelectAll] = useState(false);
    const [modalChanged, setModalChanged] = useState(false);

    useEffect(() => {
        setModalChanged(
            JSON.stringify(modalNotifications) !== JSON.stringify(editableData.notifications)
        );
    }, [modalNotifications, editableData.notifications]);

    const openNotifModal = (e) => {
        e?.stopPropagation();
        const copy = (editableData.notifications || []).map(n => ({ ...n }));
        setModalNotifications(copy);
        setModalSelected({});
        setModalSelectAll(false);
        setNotifModalOpen(true);
    };

    const closeNotifModal = () => {
        setNotifModalOpen(false);
    };

    const handleModalFieldChange = (idx, field, value) => {
        const arr = [...modalNotifications];
        arr[idx] = { ...arr[idx], [field]: value };
        setModalNotifications(arr);
    };

    const handleModalToggleSelect = (id) => {
        setModalSelected(prev => {
            const next = { ...prev };
            if (next[id]) delete next[id];
            else next[id] = true;
            const total = modalNotifications.length;
            const selectedCount = Object.keys(next).length;
            setModalSelectAll(selectedCount === total && total > 0);
            return next;
        });
    };

    const handleModalToggleSelectAll = (checked) => {
        if (checked) {
            const all = {};
            modalNotifications.forEach(n => { if (n.id) all[n.id] = true; });
            setModalSelected(all);
            setModalSelectAll(true);
        } else {
            setModalSelected({});
            setModalSelectAll(false);
        }
    };

    const handleModalAddNewRow = () => {
        const newRow = { id: `new-${Date.now()}`, header: '', message: '' };
        setModalNotifications(prev => [...prev, newRow]);
    };

    const handleModalDeleteSelected = () => {
        if (Object.keys(modalSelected).length === 0) return;
        const remaining = modalNotifications.filter(n => !modalSelected[n.id]);
        setModalNotifications(remaining);
        setModalSelected({});
        setModalSelectAll(false);
    };

    const handleModalSave = () => {
        setEditableData(prev => ({ ...prev, notifications: modalNotifications }));
        setDisplayItems(modalNotifications.slice(0, 7));
        setCurrentNotifIndex(0);
        setNotifModalOpen(false);
    };

    // ---------- Delete Confirmation ----------
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    return (
        <div className='landing-banner'>
            <div className='absolute top-[20%] right-0 p-4 z-[60] pointer-events-auto'>
                {!isEditing && (
                    <button onClick={handleEditClick} className="bg-secd dark:bg-drkp text-text px-4 py-2 rounded-md shadow-md hover:bg-brwn hover:text-prim transition-colors flex items-center gap-2"><Pencil /> Edit</button>
                )}
            </div>

            {/* Video + Banner */}
            <div className="flex h-[30vh] md:h-[25vh] lg:h-[65vh] top-[15vmax] bg-center relative">
                <video
                    className='min-h-[50vmax] w-full bg-center fixed -top-12 z-10'
                    autoPlay loop muted ref={videoRef} id='BgVid'
                    playsInline>
                    <source src={"./Banners/Vid_banner/Landing_page_draft.mp4"} type='video/mp4' />
                </video>

                {/* Contact Section */}
                <div className="absolute flex gap-3 z-50 bottom-[50%] md:bottom-[60%] tabland:bottom-[10%] lg:bottom-[35%] xl:bottom-[50%] left-0 mb-3 ml-3 md:w-[550px] pointer-events-auto "
                    ref={disableWheelScroll}
                >
                    {isEditing ? (
                        <>
                            <input
                                type="tel"
                                value={editableData.phone}
                                onChange={(e) => setEditableData({ ...editableData, phone: e.target.value })}
                                className="w-full rounded-full px-3 py-1 lg:py-2 lg:px-3 text-text dark:text-white"
                            />
                            <input
                                type="email"
                                value={editableData.email}
                                onChange={(e) => setEditableData({ ...editableData, email: e.target.value })}
                                className="w-full rounded-full px-3 py-1 lg:py-2 lg:px-3 text-text dark:text-white"
                            />
                        </>
                    ) : (
                        <>
                            <button onClick={() => window.location.href = `tel:${editableData.phone}`} onWheel={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                                className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                                dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                                bg-[position:0%_100%] text-[1lvh] lg:text-lg text-text dark:text-white bg-gradient-to-l from-secd
                                dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                                duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%]  overflow-hidden">
                                {editableData.phone}
                            </button>

                            <button onClick={() => window.open(`mailto:${editableData.email}`, '_blank')} onWheel={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                                className="bg-prim dark:bg-drkp rounded-full px-3 py-1 lg:py-2 lg:px-3 outline outline-prim
                                dark:outline-drkp outline-offset-2 hover:outline-secd dark:hover:outline-drks bg-[length:200%_100%]
                                bg-[position:0%_100%] text-[9px] md:text-[10px] lg:text-xs xl:text-sm text-text dark:text-white bg-gradient-to-l from-secd
                                dark:from-drks from-0% via-secd dark:via-drks via-50% to-white to-50% border-slate-700 w-full
                                duration-[150ms] ease-in transition-all hover:bg-[position:-100%_100%] overflow-hidden">
                                {editableData.email}
                            </button>
                        </>
                    )}
                </div>

                <div ref={toggleRef}>
                    <Toggle toggle={toggle} theme={theme} attr={"absolute -top-[24%] h-12 w-[11%] bg-[#0000001a] rounded-br-xl"} />
                </div>

                {isEditing && (
                    <div className="absolute -top-[27%] right-8 z-[60]">
                        <button
                            onClick={openNotifModal}
                            className="bg-secd dark:bg-drkp p-2 rounded shadow-md hover:bg-brwn hover:text-prim flex items-center gap-1"
                            aria-label="Edit notifications"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                )}

                {/* Notification section */}
                <div className='absolute font-popp text-[1.5vmax] max-w-[50vmax] -top-12 md:-top-28 -right-5 lg:right-[1vmax] pointer-events-none overflow-hidden'>
                    <div className='relative no-wrap h-[15vh] md:h-[30vh] w-[35vmax] mt-4 pointer-events-none overflow-hidden'>
                        {displayItems?.map((elm, i) => (
                            <p
                                key={i} className={`absolute z-20 min-w-[20vmax] max-w-[30vmax] h-[70%] md:h-full translate-x-[-40vmax] 
                                    animate-[LslideIn_50s_ease-in_infinite] px-4 py-[4vw] border-y-2 lg:line-clamp-none line-clamp-2 
                                    [border-image:linear-gradient(to_right,theme(colors.secd),theme(colors.accn),theme(colors.secd))_1] 
                                    dark:[border-image:linear-gradient(to_right,theme(colors.drks),theme(colors.drka),theme(colors.drks))_1] 
                                    bg-[#0000001a] backdrop-blur-[0px] text-white text-[125%]`}
                                style={{ animationDelay: `${i * 8}s` }}
                            >
                                <span className="font-bold text-secd block text-[12px] md:text-2xl leading-tight">
                                    {elm.header}
                                </span>
                                <span className="text-[10px] md:text-[16px] leading-snug">
                                    {elm.message}
                                </span>
                            </p>
                        ))}
                    </div>
                </div>

                <img alt="Hell on earth" src={College} className={`h-[100vh] w-[100vw] fixed z-0`} />
                <div className='absolute bottom-1/2 right-4 p-4 z-[60] pointer-events-auto'>
                    {isEditing && (
                        <div className="flex gap-2">
                            <button onClick={handleCancel} className="bg-gray-400 text-white rounded-[10px] px-4 py-2">Cancel</button>
                            <button onClick={handleSave} className="bg-secd dark:bg-drkp text-text px-4 py-2 rounded-md shadow-md hover:bg-brwn hover:text-prim transition-colors flex items-center gap-2">Save</button>
                        </div>
                    )}
                    {finalizing && (
                        <div className="flex gap-2">
                            <button onClick={handleDiscardChanges} className="bg-gray-400 text-text rounded-[10px] px-4 py-2">Discard Changes</button>
                            <button onClick={handleRequest} className="bg-secd dark:bg-drkp text-text px-4 py-2 rounded-md shadow-md hover:bg-brwn hover:text-prim transition-colors flex items-center gap-2">Request</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ---------- Notification Modal ---------- */}
            {notifModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-start justify-center pt-24 bg-black/60">
                    <div
                        className="w-[90%] md:w-[800px] max-h-[80vh] overflow-auto bg-white dark:bg-drkp rounded-xl p-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Edit Notifications</h3>
                            <button className="p-2 rounded hover:bg-gray-100" onClick={closeNotifModal}>
                                ✕
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 border text-center w-[60px]">S.No</th>
                                        <th className="p-2 border">Heading</th>
                                        <th className="p-2 border">Description</th>
                                        <th className="p-2 border w-[80px] text-center">
                                            <input
                                                type="checkbox"
                                                checked={modalSelectAll}
                                                onChange={(e) => handleModalToggleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalNotifications.map((n, idx) => (
                                        <tr key={n.id || idx} className="border-b hover:bg-gray-50">
                                            <td className="p-2 border text-center align-top">{idx + 1}</td>
                                            <td className="p-2 border align-top">
                                                <input
                                                    type="text"
                                                    value={n.header || ''}
                                                    onChange={(e) => handleModalFieldChange(idx, 'header', e.target.value)}
                                                    className="w-full p-1 border rounded"
                                                    placeholder="Heading"
                                                />
                                            </td>
                                            <td className="p-2 border align-top">
                                                <textarea
                                                    value={n.message || ''}
                                                    onChange={(e) => handleModalFieldChange(idx, 'message', e.target.value)}
                                                    className="w-full p-1 border rounded"
                                                    rows={2}
                                                    placeholder="Description"
                                                />
                                            </td>
                                            <td className="p-2 border text-center align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={!!modalSelected[n.id]}
                                                    onChange={() => handleModalToggleSelect(n.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {modalNotifications.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-500">No notifications. Add a new row below.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2 justify-center mt-4">
                            <button onClick={handleModalAddNewRow} className="bg-secd text-text rounded-[8px] px-3 py-2 flex items-center gap-2">
                                <Plus size={14} /> Add New Row
                            </button>
                            {Object.keys(modalSelected).length > 0 && (
                                <button onClick={() => setDeleteConfirm(true)} className="bg-red-500 text-white rounded-[8px] px-3 py-2 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete Selected
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={closeNotifModal} className="px-4 py-2 rounded bg-gray-400 text-white">Cancel</button>
                            {modalChanged && (
                                <button onClick={handleModalSave} className="px-4 py-2 rounded bg-secd text-text">Save</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Delete Confirmation ---------- */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-white dark:bg-drkp p-6 rounded-xl w-[350px]">
                        <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                        <p className="text-sm mb-4">Are you sure you want to delete the selected notifications?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="px-4 py-2 rounded bg-gray-400 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleModalDeleteSelected();
                                    setDeleteConfirm(false);
                                }}
                                className="px-4 py-2 rounded bg-red-500 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Confirm Request Popup ---------- */}
            {confirmPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
                    <div className="bg-drkt dark:bg-drkp p-6 rounded-xl w-[450px]">
                        <h2 className="text-xl font-bold mb-4 dark:text-drkt text-text">
                            Final Request for the Changes
                        </h2>

                        <p className="text-sm text-text dark:text-drkt mb-6">
                            Are you sure you want to request the changes? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmPopup(false)}
                                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRequest}
                                className="px-4 py-2 rounded bg-secd text-text hover:bg-brwn"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImgSld;