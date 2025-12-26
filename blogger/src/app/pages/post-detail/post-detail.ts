import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  isLiking = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private commentService = inject(CommentService);
  private likeService = inject(LikeService);
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch post details directly from backend
    this.blogService.getPostById(id).subscribe({
      next: (post) => {
        this.post = post;
        this.loadComments(id);
      },
      error: (err) => {
        console.error('Erreur chargement post:', err);
        this.post = null;
      }
    });
  }

  loadComments(postId: number): void {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  addComment(): void {
    if (!this.post || !this.newComment.trim()) return;

    this.commentService.addComment(this.post.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.unshift(comment); // Add to beginning
        this.newComment = '';
        if (this.post) {
          this.post.comments += 1;
        }
      },
      error: (err) => {
        console.error('Error adding comment:', err);
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        if (this.post) {
          this.post.comments -= 1;
        }
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
      }
    });
  }

  onLike(): void {
    if (!this.post || this.isLiking) return;

    this.isLiking = true;
    this.likeService.toggleLike(this.post.id).subscribe({
      next: (response) => {
        if (this.post) {
          this.post.likedByCurrentUser = response.liked;
          this.post.likes += response.liked ? 1 : -1;
        }
        setTimeout(() => this.isLiking = false, 300);
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.isLiking = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
