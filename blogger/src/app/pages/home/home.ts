import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostCard } from '../../components/post-card/post-card';
import { PostForm } from '../../components/post-form/post-form';
import { BlogService } from '../../services/blog.service';
import { Post, CreatePostRequest } from '../../models/post';
import { HeaderComponent } from '../../components/header/header';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeaderComponent, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  posts: Post[] = [];
  filteredPosts: Post[] = [];

  categories = ['Tous', 'Tech', 'Photo', 'Cuisine', 'Voyage', 'Lifestyle'];
  selectedCategory = 'Tous';
  currentView: 'home' | 'create' = 'home';

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🏠 Home component initialisé');
    
    // 🔥 Charger les posts depuis la base de données
    this.blogService.loadPosts();
    
    // S'abonner aux changements de posts
    this.blogService.posts$.subscribe(posts => {
      console.log('📥 Posts reçus dans Home component:', posts);
      console.log('📊 Nombre de posts reçus:', posts.length);
      this.posts = posts;
      this.applyFilters();
      console.log('🔍 Posts après filtrage:', this.filteredPosts.length);
    });
  }

  /* ================== SEARCH ================== */
  onSearch(query: string): void {
    this.applyFilters(query);
  }

  /* ================== CATEGORY ================== */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(search: string = ''): void {
    let result = [...this.posts];

    if (this.selectedCategory !== 'Tous') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      );
    }

    this.filteredPosts = result;
  }

  /* ================== POST ================== */
  onPostSubmit(postData: CreatePostRequest): void {
    this.blogService.addPost(postData).subscribe(() => {
      this.currentView = 'home';
    });
  }

  onViewDetails(postId: number): void {
    this.router.navigate(['/post', postId]);
  }

  onViewChange(view: string): void {
  if (view === 'home' || view === 'create') {
    this.currentView = view;
  }
}


}
