import { useState } from "react";
import { useGetApiReportsNearby } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MapPicker } from "@/components/ui/MapPicker";

export const NearbyPage: React.FC = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5); // Default 5km
    const [hasSearched, setHasSearched] = useState(false);

    const { data: nearbyResults, isLoading, refetch } = useGetApiReportsNearby(
        {
            lat: location?.lat,
            lng: location?.lng,
            radius: radius,
        },
        {
            query: { enabled: false }, // Don't auto-fetch
        }
    );

    const results = (nearbyResults as any)?.data?.data || [];

    const handleSearch = () => {
        if (location) {
            setHasSearched(true);
            refetch();
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Unable to get your location. Please select manually on the map.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">Nearby Posts</h1>
                    <p className="text-muted-foreground text-sm">Find lost or found items near your location</p>
                </div>

                {/* Search Controls */}
                <div className="bg-card text-card-foreground rounded-3xl shadow-sm border border-border p-6 mb-6">
                    <div className="space-y-6">
                        {/* Map */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Select Location
                            </label>
                            <div className="rounded-2xl overflow-hidden border border-border h-96 mb-4">
                                <MapPicker
                                    initialLocation={location || undefined}
                                    onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={getCurrentLocation}
                                className="w-full md:w-auto"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Use My Current Location
                            </Button>
                        </div>

                        {/* Radius */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Search Radius: {radius} km
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            disabled={!location || isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Search Nearby Posts
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div>
                    {!hasSearched ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Select a Location
                            </h3>
                            <p className="text-muted-foreground">
                                Choose a location on the map and search for nearby posts
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Searching nearby...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No Nearby Posts
                            </h3>
                            <p className="text-muted-foreground">
                                Try increasing the search radius or selecting a different location
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Found <span className="font-semibold text-foreground">{results.length}</span> posts
                                    within {radius} km
                                </p>
                            </div>
                            <div className="space-y-4">
                                {results.map((post: any) => (
                                    <ReportCard key={post.id} report={post} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
