import { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../services/api';
import useAuth from '../../hooks/useAuth';
import PostCard from '../../components/Feed/PostCard';
import { ReportModal, BlockModal } from '../../components/Safety/SafetyModals';
import { PostSkeleton } from '../../components/Skeletons/Skeletons';
import './Feed.css';

const LIMIT = 10;

const Feed = () => {
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchTimeout = useRef(null);
  
  // Create Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Safety Modals State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const fetchFeed = useCallback(async (pageNum = 1, searchTerm = '', replace = true) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await API.get('/posts/feed', {
        params: { page: pageNum, limit: LIMIT, search: searchTerm }
      });
      const newPosts = data.data || [];
      setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchFeed(1, search, true);
  }, [search, fetchFeed]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 350);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, search, false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPostImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostImage) return;
    
    setIsPosting(true);
    try {
      const { data } = await API.post('/posts', {
        content: newPostContent,
        image: newPostImage
      });
      
      // Prepend new post
      setPosts([data.data, ...posts]);
      
      // Clear form
      setNewPostContent('');
      setNewPostImage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    try {
      const { data } = await API.post(`/auth/follow/${targetUserId}`);
      const { following } = data.data;
      
      // Update global user state with new following list
      updateUser({ ...user, following });
      
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleReportClick = (author) => {
    setSelectedUser(author);
    setReportModalOpen(true);
  };

  const handleBlockClick = (author) => {
    setSelectedUser(author);
    setBlockModalOpen(true);
  };

  const handleReportSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleBlockSuccess = (message, blockedId) => {
    setSuccessMessage(message);
    // Remove posts from the blocked user
    setPosts(posts.filter(p => p.author?._id !== blockedId));
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="feed-page">
      {/* Success Message */}
      {successMessage && (
        <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Create Post Box */}
      <div className="create-post-card animate-fade-in">
        <div className="create-post-header">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="You" loading="lazy" />
          ) : (
            <div className="post-user-avatar" style={{ width: 40, height: 40, fontSize: '1.2rem' }}>
              {user?.name?.charAt(0)}
            </div>
          )}
          <textarea 
            placeholder={`Share your travel moments, ${user?.name?.split(' ')[0]}...`}
            rows="2"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </div>

        {newPostImage && (
          <div className="image-preview-container">
            <button className="remove-image-btn" onClick={() => setNewPostImage('')}>✕</button>
            <img src={newPostImage} alt="Preview" loading="lazy" />
          </div>
        )}

        <div className="create-post-actions">
          <label className="image-upload-label">
            📸 Add Photo
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
          </label>
          <button 
            className="btn btn-primary" 
            onClick={handleCreatePost}
            disabled={isPosting || (!newPostContent.trim() && !newPostImage)}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Search posts..."
          value={searchInput}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="feed-stream">
          {[1,2,3,4].map(i => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="feed-stream">
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                onFollowToggle={handleFollowToggle}
                onPostUpdate={handlePostUpdate}
                onReportClick={handleReportClick}
                onBlockClick={handleBlockClick}
              />
            ))}
          </div>
          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{ minWidth: '160px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              You've seen all the posts 🌍
            </p>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌍</span>
          <h3>{search ? `No posts found for "${search}"` : 'Your feed is empty!'}</h3>
          <p>{search ? 'Try a different search term.' : 'Follow other travelers or create your first post to get started.'}</p>
        </div>
      )}

      {/* Safety Modals */}
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        reportedUserId={selectedUser?._id}
        reportedUserName={selectedUser?.name}
        onReportSuccess={handleReportSuccess}
      />
      
      <BlockModal 
        isOpen={blockModalOpen} 
        onClose={() => setBlockModalOpen(false)} 
        blockedUserId={selectedUser?._id}
        blockedUserName={selectedUser?.name}
        onBlockSuccess={handleBlockSuccess}
      />
    </div>
  );
};

export default Feed;
