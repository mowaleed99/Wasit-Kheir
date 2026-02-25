import { useAuth } from "@/context/AuthContext";
import { useMyReports, extractList } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Mail, Phone, MapPin, Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const { data: myPostsData, isLoading: postsLoading, error: postsError } = useMyReports({ pageSize: 100 });

  // API returns { success, data: { data: [], page, totalPages } }
  const userPosts = extractList(myPostsData);

  // Report type mapping: LostItem/FoundItem/LostPerson/FoundPerson
  const matchesTab = (report: any) => {
    if (activeTab === 'all') return true;
    const t = (report.type || '').toLowerCase();
    if (activeTab === 'lost') return t.startsWith('lost');
    if (activeTab === 'found') return t.startsWith('found');
    return false;
  };
  const filteredPosts = userPosts.filter(matchesTab);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <img
                src={
                  user?.avatar ||
                  user?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.fullName || "User"
                  )}&background=3b82f6&color=fff&size=128`
                }
                alt={user?.fullName || "User"}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.fullName || "Unknown User"}
                </h1>
                <div className="space-y-2">
                  {user?.email && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.phoneNumber}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                  {user?.createdAt && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Joined {formatDate(user.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{userPosts.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Posts</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-green-600">
            {userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('found')).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Found Items</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-orange-600">
            {userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('lost')).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Lost Items</p>
        </div>
      </div>

      {/* User's Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">My Posts</h2>

        {postsLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your posts...</p>
          </div>
        ) : postsError ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600">Failed to load posts. Please try again.</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't created any posts yet</p>
            <Link to="/create-report">
              <Button className="mt-4">Create Your First Report</Button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                All Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('lost')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'lost'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Lost Items ({userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('lost')).length})
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'found'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Found Items ({userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('found')).length})
              </button>
            </div>

            {/* Posts Display */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No {activeTab === 'all' ? '' : activeTab} posts found
                </div>
              ) : (
                filteredPosts.map((post: any) => (
                  <ReportCard key={post.id} report={post} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
