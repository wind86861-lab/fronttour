import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toursAPI } from '../../services/api';

const AgentTourView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Selection state
    const [selectedOutbound, setSelectedOutbound] = useState(null);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [nights, setNights] = useState(7);

    // Price breakdown state
    const [priceBreakdown, setPriceBreakdown] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    useEffect(() => {
        fetchTour();
    }, [id]);

    const fetchTour = async () => {
        try {
            setLoading(true);
            const data = await toursAPI.getById(id);
            setTour(data);

            // Auto-select first options
            if (data.flightVariants?.length > 0) {
                const firstOutbound = data.flightVariants.find(f => f.type === 'outbound');
                const firstReturn = data.flightVariants.find(f => f.type === 'return');
                if (firstOutbound) setSelectedOutbound(firstOutbound._id);
                if (firstReturn) setSelectedReturn(firstReturn._id);
            }
            if (data.hotelRoomTypes?.length > 0) {
                setSelectedRoomType(data.hotelRoomTypes[0]._id);
            }
            if (data.nightsFrom) {
                setNights(data.nightsFrom);
            }
        } catch (err) {
            setError(err.message || 'Failed to load tour');
        } finally {
            setLoading(false);
        }
    };

    // Calculate price whenever selections change
    useEffect(() => {
        if (tour && selectedOutbound && selectedReturn && selectedRoomType && nights > 0) {
            calculatePrice();
        }
    }, [selectedOutbound, selectedReturn, selectedRoomType, nights, tour]);

    const calculatePrice = async () => {
        if (!tour || !selectedOutbound || !selectedReturn || !selectedRoomType || !nights) {
            return;
        }

        setCalculatingPrice(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/tours/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tourId: tour._id,
                    outboundFlightId: selectedOutbound,
                    returnFlightId: selectedReturn,
                    roomTypeId: selectedRoomType,
                    nights: parseInt(nights)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to calculate price');
            }

            const data = await response.json();
            setPriceBreakdown(data.breakdown);
        } catch (err) {
            console.error('Price calculation error:', err);
            setError('Failed to calculate price');
        } finally {
            setCalculatingPrice(false);
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted">Loading tour details...</p>
                </div>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    <i className="fa fa-exclamation-circle me-2"></i>{error || 'Tour not found'}
                </div>
                <Link to="/agent/tours" className="btn btn-outline-secondary">
                    <i className="fa fa-arrow-left me-2"></i>Back to Tours
                </Link>
            </div>
        );
    }

    const outboundFlights = tour.flightVariants?.filter(f => f.type === 'outbound') || [];
    const returnFlights = tour.flightVariants?.filter(f => f.type === 'return') || [];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0">{tour.title}</h3>
                    <p className="text-muted small mb-0">
                        <i className="fa fa-route me-2"></i>
                        {tour.fromCity} → {tour.toCity}
                    </p>
                </div>
                <Link to="/agent/tours" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    <i className="fa fa-arrow-left me-2"></i>Back to Tours
                </Link>
            </div>

            <div className="row g-4">
                {/* Left Column: Tour Details & Selections */}
                <div className="col-lg-8">
                    {/* Tour Information */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">Tour Information</h5>
                        {tour.images?.[0] && (
                            <img
                                src={tour.images[0].startsWith('http') ? tour.images[0] : `http://localhost:5000${tour.images[0]}`}
                                alt={tour.title}
                                className="img-fluid rounded-3 mb-3"
                                style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                            />
                        )}
                        <p className="text-muted">{tour.description || 'No description available'}</p>
                        <div className="row g-3 mt-2">
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3">
                                    <small className="text-muted d-block">Nights Range</small>
                                    <strong>{tour.nightsFrom}-{tour.nightsTill} nights</strong>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3">
                                    <small className="text-muted d-block">Category</small>
                                    <strong>{tour.category}★ Hotel</strong>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3">
                                    <small className="text-muted d-block">Meal Type</small>
                                    <strong>{tour.mealType || 'N/A'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flight Selection */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fa fa-plane text-primary me-2"></i>Select Flights
                        </h5>

                        {/* Outbound Flights */}
                        <div className="mb-4">
                            <label className="form-label fw-bold small text-uppercase text-muted">Outbound Flight</label>
                            <div className="row g-2">
                                {outboundFlights.map(flight => (
                                    <div className="col-md-6" key={flight._id}>
                                        <div
                                            className={`border rounded-3 p-3 cursor-pointer transition ${selectedOutbound === flight._id ? 'border-primary border-2 bg-primary bg-opacity-10' : 'border-secondary-subtle'}`}
                                            onClick={() => setSelectedOutbound(flight._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="fw-bold">{flight.airline}</div>
                                                    <small className="text-muted">{flight.flightNumber}</small><br />
                                                    <small className="text-muted">
                                                        {flight.departureTime && flight.arrivalTime &&
                                                            `${flight.departureTime} - ${flight.arrivalTime}`
                                                        }
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary fs-5">${flight.price}</div>
                                                    {selectedOutbound === flight._id && (
                                                        <span className="badge bg-primary mt-1">Selected</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Return Flights */}
                        <div>
                            <label className="form-label fw-bold small text-uppercase text-muted">Return Flight</label>
                            <div className="row g-2">
                                {returnFlights.map(flight => (
                                    <div className="col-md-6" key={flight._id}>
                                        <div
                                            className={`border rounded-3 p-3 cursor-pointer transition ${selectedReturn === flight._id ? 'border-success border-2 bg-success bg-opacity-10' : 'border-secondary-subtle'}`}
                                            onClick={() => setSelectedReturn(flight._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="fw-bold">{flight.airline}</div>
                                                    <small className="text-muted">{flight.flightNumber}</small><br />
                                                    <small className="text-muted">
                                                        {flight.departureTime && flight.arrivalTime &&
                                                            `${flight.departureTime} - ${flight.arrivalTime}`
                                                        }
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-success fs-5">${flight.price}</div>
                                                    {selectedReturn === flight._id && (
                                                        <span className="badge bg-success mt-1">Selected</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hotel Selection */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fa fa-bed text-primary me-2"></i>Select Room Type
                        </h5>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Number of Nights</label>
                                <input
                                    type="number"
                                    className="form-control form-control-lg"
                                    min={tour.nightsFrom}
                                    max={tour.nightsTill}
                                    value={nights}
                                    onChange={e => setNights(parseInt(e.target.value) || tour.nightsFrom)}
                                />
                                <small className="text-muted">Range: {tour.nightsFrom}-{tour.nightsTill} nights</small>
                            </div>
                        </div>
                        <div className="row g-2">
                            {tour.hotelRoomTypes?.map(room => (
                                <div className="col-md-6" key={room._id}>
                                    <div
                                        className={`border rounded-3 p-3 cursor-pointer transition ${selectedRoomType === room._id ? 'border-warning border-2 bg-warning bg-opacity-10' : 'border-secondary-subtle'}`}
                                        onClick={() => setSelectedRoomType(room._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-bold">{room.typeName}</div>
                                                <small className="text-muted">{room.description}</small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-warning fs-6">${room.pricePerNight}/night</div>
                                                <small className="text-muted d-block">× {nights} nights</small>
                                                <div className="fw-bold text-dark">${room.pricePerNight * nights}</div>
                                                {selectedRoomType === room._id && (
                                                    <span className="badge bg-warning text-dark mt-1">Selected</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Base Services */}
                    {tour.baseServices?.length > 0 && (
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-3">
                                <i className="fa fa-concierge-bell text-primary me-2"></i>Included Services
                            </h5>
                            <p className="text-muted small mb-3">These services are always included in the tour price.</p>
                            <div className="row g-2">
                                {tour.baseServices.map((service, index) => (
                                    <div className="col-md-6" key={index}>
                                        <div className="border border-success-subtle bg-success-subtle rounded-3 p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-bold">{service.serviceName}</div>
                                                    <small className="text-muted">{service.description}</small>
                                                </div>
                                                <div className="fw-bold text-success">${service.fixedCost}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Price Calculator */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
                        <h5 className="fw-bold mb-4">
                            <i className="fa fa-calculator text-primary me-2"></i>Price Breakdown
                        </h5>

                        {calculatingPrice ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary mb-2"></div>
                                <p className="text-muted small">Calculating price...</p>
                            </div>
                        ) : priceBreakdown ? (
                            <>
                                <div className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Outbound Flight</span>
                                        <span className="fw-bold">${priceBreakdown.outboundFlight?.price || 0}</span>
                                    </div>
                                    <small className="text-muted d-block">{priceBreakdown.outboundFlight?.airline}</small>
                                </div>

                                <div className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Return Flight</span>
                                        <span className="fw-bold">${priceBreakdown.returnFlight?.price || 0}</span>
                                    </div>
                                    <small className="text-muted d-block">{priceBreakdown.returnFlight?.airline}</small>
                                </div>

                                <div className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Hotel ({nights} nights)</span>
                                        <span className="fw-bold">${priceBreakdown.hotel?.total || 0}</span>
                                    </div>
                                    <small className="text-muted d-block">
                                        {priceBreakdown.hotel?.typeName} - ${priceBreakdown.hotel?.pricePerNight}/night
                                    </small>
                                </div>

                                {priceBreakdown.baseServices?.length > 0 && (
                                    <div className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted small">Base Services</span>
                                            <span className="fw-bold">${priceBreakdown.baseServicesTotal || 0}</span>
                                        </div>
                                        {priceBreakdown.baseServices.map((service, idx) => (
                                            <small key={idx} className="text-muted d-block">
                                                • {service.serviceName} (${service.fixedCost})
                                            </small>
                                        ))}
                                    </div>
                                )}

                                <div className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">Subtotal</span>
                                        <span className="fw-bold fs-5">${priceBreakdown.subtotal || 0}</span>
                                    </div>
                                </div>

                                <div className="mb-4 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-success small">
                                            Agent Markup ({priceBreakdown.agentMarkup?.type === 'PERCENT'
                                                ? `${priceBreakdown.agentMarkup?.value}%`
                                                : 'Fixed'})
                                        </span>
                                        <span className="fw-bold text-success">+${priceBreakdown.agentMarkup?.amount || 0}</span>
                                    </div>
                                </div>

                                <div className="bg-primary bg-opacity-10 rounded-3 p-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-uppercase">Final Total</span>
                                        <span className="fw-bold text-primary fs-3">${priceBreakdown.finalTotal || 0}</span>
                                    </div>
                                    <small className="text-muted d-block mt-1">Per person</small>
                                </div>

                                <button className="btn btn-primary w-100 py-3 rounded-pill shadow mb-3">
                                    <i className="fa fa-ticket-alt me-2"></i>Book This Tour
                                </button>

                                <div className="text-center">
                                    <small className="text-muted">Need help? Contact support</small>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <i className="fa fa-info-circle text-muted fs-3 mb-2 opacity-25"></i>
                                <p className="text-muted small">Select options to see price</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .transition { transition: all 0.3s ease; }
                .text-primary { color: #30c39e !important; }
                .bg-primary { background-color: #30c39e !important; }
                .border-primary { border-color: #30c39e !important; }
                .btn-primary { background-color: #30c39e; border-color: #30c39e; }
                .btn-primary:hover { background-color: #28a686; border-color: #28a686; }
            `}</style>
        </div>
    );
};

export default AgentTourView;
