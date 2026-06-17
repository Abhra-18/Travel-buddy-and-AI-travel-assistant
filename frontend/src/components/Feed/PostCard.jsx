import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import API from '../../services/api';

const PostCard = ({ post, onFollowToggle, onPostUpdate, onReportClick, onBlockClick }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = post.likes?.includes(user?._id);
  const isFollowing = user?.following?.includes(post.author._id);
  const isOwnPost = user?._id === post.author._id;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/like`);
      onPostUpdate({ ...post, likes: data.data });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      onPostUpdate({ ...post, comments: data.data });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-card animate-fade-in">
      {/* Header */}
      <div className="post-header">
        <div className="post-user-info">
          {post.author.profilePicture ? (
            <img src={post.author.profilePicture} alt={post.author.name} className="post-user-avatar" />
          ) : (
            <div className="post-user-avatar">{post.author.name?.charAt(0)}</div>
          )}
          <div className="post-user-details">
            <h4 style={{ display: 'flex', alignItems: 'center' }}>
              {post.author.name}
              {post.author.isVerified && <span style={{ color: '#10b981', marginLeft: '4px', fontSize: '1rem' }} title="Verified Identity">✅</span>}
            </h4>
            <p className="post-time">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Header Right Side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Follow Button */}
          {!isOwnPost && (
            <button 
              className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} 
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => onFollowToggle(post.author._id)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* Options Dropdown */}
          {!isOwnPost && onReportClick && onBlockClick && (
            <div className="post-card__options" style={{ position: 'relative' }}>
              <button 
                className="btn-icon" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}
                onClick={(e) => {
                  const menu = e.currentTarget.nextElementSibling;
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }}
              >
                ⋮
              </button>
              <div className="options-menu card" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', zIndex: 10, minWidth: '120px', padding: '0.5rem 0' }}>
                <button 
                  style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
                  onClick={() => onReportClick(post.author)}
                >
                  🚩 Report
                </button>
                <button 
                  style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#dc2626' }}
                  onClick={() => onBlockClick(post.author)}
                >
                  🚫 Block
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && <div className="post-content">{post.content}</div>}
      
      {/* Image */}
      {post.image && (
        <img src={post.image} alt="Travel Post" className="post-image" loading="lazy" />
      )}

      {/* Actions */}
      <div className="post-actions">
        <button 
          className={`post-action-btn ${isLiked ? 'liked' : ''}`} 
          onClick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button 
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬
        </button>
      </div>

      {/* Likes Count */}
      {post.likes?.length > 0 && (
        <div className="post-likes-count">
          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
        </div>
      )}

      {/* Comments Preview */}
      {post.comments?.length > 0 && !showComments && (
        <div 
          className="post-comments-section" 
          style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
          onClick={() => setShowComments(true)}
        >
          View all {post.comments.length} comments
        </div>
      )}

      {/* Full Comments Section */}
      {showComments && (
        <div className="post-comments-section">
          <div className="comment-list">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-text-bubble">
                  <span className="comment-author">{comment.user?.name}</span>
                  {comment.text}
                </div>
              </div>
            ))}
          </div>
          
          <form className="add-comment-form" onSubmit={handleComment}>
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default React.memo(PostCard);
