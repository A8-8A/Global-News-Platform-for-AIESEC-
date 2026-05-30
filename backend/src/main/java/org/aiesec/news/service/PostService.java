package org.aiesec.news.service;

import org.aiesec.news.config.AppProperties;
import org.aiesec.news.domain.*;
import org.aiesec.news.dto.PostDtos.*;
import org.aiesec.news.exception.ForbiddenException;
import org.aiesec.news.exception.NotFoundException;
import org.aiesec.news.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Posting, feed, and engagement logic.
 *
 * The weekly limit is the centrepiece. The rule from the spec:
 * an MCP may publish up to 2 posts per rolling 7-day window; a 3rd+
 * post does not publish - it goes to the approval queue (PENDING).
 *
 * Implementation: NO stored counter. On each create we COUNT the
 * author's posts in the trailing 7 days. < limit -> APPROVED now;
 * >= limit -> PENDING. This is stateless, self-resetting (the window
 * just slides), and cannot drift.
 */
@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final int maxPostsPerWeek;
    private final int weekWindowDays;

    public PostService(PostRepository postRepository,
                       CommentRepository commentRepository,
                       LikeRepository likeRepository,
                       UserRepository userRepository,
                       AppProperties props) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.maxPostsPerWeek = props.posting().maxPostsPerWeek();
        this.weekWindowDays = props.posting().weekWindowDays();
    }

    // ----------------------------------------------------------------
    // Creating posts (MCP only)
    // ----------------------------------------------------------------

    /**
     * Create a post. Only MCPs may do this. The returned status tells
     * the caller whether it was published or queued.
     */
    @Transactional
    public CreatePostResponse createPost(Long userId, CreatePostRequest request) {
        User author = requireUser(userId);

        // Role enforcement: members cannot create posts.
        if (author.getRole() != Role.MCP) {
            throw new ForbiddenException("Only MCPs can create posts.");
        }

        // Weekly-limit check - count posts in the trailing window.
        Instant windowStart = Instant.now().minus(weekWindowDays, ChronoUnit.DAYS);
        long recentPosts = postRepository.countByAuthorAndCreatedAtAfter(author, windowStart);

        // Within limit -> publish immediately. Over -> approval queue.
        PostStatus status = recentPosts < maxPostsPerWeek
                ? PostStatus.APPROVED
                : PostStatus.PENDING;

        Post post = new Post();
        post.setAuthor(author);
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setExcerpt(emptyToNull(request.excerpt()));
        post.setTag(emptyToNull(request.tag()));
        post.setMediaUrl(emptyToNull(request.mediaUrl()));
        post.setStatus(status);

        post = postRepository.save(post);
        return new CreatePostResponse(post.getId(), post.getStatus().name());
    }

    /** An MCP's own posts, any status (so they can see what's PENDING). */
    @Transactional(readOnly = true)
    public List<PostResponse> getMyPosts(Long userId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> toPostResponse(p, userId))
                .toList();
    }

    /** Delete own post — authors can remove their own posts. */
    @Transactional
    public void deleteOwnPost(Long postId, Long userId) {
        Post post = requirePost(postId);
        if (!post.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own posts.");
        }
        postRepository.delete(post);
    }

    // ----------------------------------------------------------------
    // Feed
    // ----------------------------------------------------------------

    /**
     * The public feed: APPROVED posts, newest first.
     *
     * @param viewerId id of the logged-in user, or null if anonymous -
     *                 used only to fill in {@code likedByMe}.
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(Long viewerId) {
        return postRepository
                .findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED).stream()
                .map(p -> toPostResponse(p, viewerId))
                .toList();
    }

    /** A single post with its comments. Only APPROVED posts are public. */
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetail(Long postId, Long viewerId) {
        Post post = requirePost(postId);
        if (post.getStatus() != PostStatus.APPROVED) {
            throw new NotFoundException("Post not found.");
        }
        List<CommentResponse> comments = commentRepository
                .findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(PostService::toCommentResponse)
                .toList();
        return new PostDetailResponse(toPostResponse(post, viewerId), comments);
    }

    // ----------------------------------------------------------------
    // Engagement: likes + comments (any AIESEC user)
    // ----------------------------------------------------------------

    /**
     * Toggle a like on a post: if the user has liked it, unlike;
     * otherwise like. Returns the new state + count.
     */
    @Transactional
    public LikeResponse toggleLike(Long postId, Long userId) {
        Post post = requirePost(postId);
        if (post.getStatus() != PostStatus.APPROVED) {
            throw new NotFoundException("Post not found.");
        }
        User user = requireUser(userId);

        var existing = likeRepository.findByPostIdAndUserId(postId, userId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);
            liked = true;
        }
        return new LikeResponse(liked, likeRepository.countByPostId(postId));
    }

    /** Add a comment to an approved post. */
    @Transactional
    public CommentResponse addComment(Long postId, Long userId,
                                      CreateCommentRequest request) {
        Post post = requirePost(postId);
        if (post.getStatus() != PostStatus.APPROVED) {
            throw new NotFoundException("Post not found.");
        }
        User author = requireUser(userId);

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(request.content());
        comment = commentRepository.save(comment);

        return toCommentResponse(comment);
    }

    // ----------------------------------------------------------------
    // internals
    // ----------------------------------------------------------------

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    private Post requirePost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found."));
    }

    private PostResponse toPostResponse(Post post, Long viewerId) {
        boolean likedByMe = viewerId != null
                && likeRepository.existsByPostIdAndUserId(post.getId(), viewerId);
        User author = post.getAuthor();
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getExcerpt(),
                post.getTag(),
                post.getMediaUrl(),
                post.getStatus().name(),
                author.getId(),
                author.getFullName(),
                author.getOfficeName(),
                author.getPhotoUrl(),
                likeRepository.countByPostId(post.getId()),
                commentRepository.countByPostId(post.getId()),
                likedByMe,
                post.getCreatedAt());
    }

    private static CommentResponse toCommentResponse(Comment c) {
        User author = c.getAuthor();
        return new CommentResponse(
                c.getId(),
                c.getContent(),
                author.getId(),
                author.getFullName(),
                author.getOfficeName(),
                author.getPhotoUrl(),
                c.getCreatedAt());
    }

    private static String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
