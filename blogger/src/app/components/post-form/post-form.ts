import {
  Component,
  EventEmitter,
  Output,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Post, CreatePostRequest } from '../../models/post';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Placeholder } from '@tiptap/extension-placeholder';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
})
export class PostForm implements OnInit, OnDestroy, AfterViewInit {
  @Output() formSubmit = new EventEmitter<CreatePostRequest>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('editorElement') editorElement!: ElementRef;

  editor!: Editor;
  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private router = inject(Router);
  private authService = inject(AuthService);

  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    excerpt: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
    image: ['', [Validators.required]],
    category: ['Tech', Validators.required],
  });

  categories = ['Tech', 'Photo', 'Cuisine', 'Voyage', 'Lifestyle', 'Art', 'Musique'];

  isImageInputFocused = false;

  ngOnInit() {
    // L'éditeur sera initialisé dans ngAfterViewInit
  }

  ngAfterViewInit() {
    // Initialisation de l'éditeur TipTap avec configuration optimisée
    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
            // Force la configuration des headings
            HTMLAttributes: {
              class: 'editor-heading',
            },
          },
          paragraph: {
            HTMLAttributes: {
              class: 'editor-paragraph',
            },
          },
        }),
        Underline,
        TextStyle,
        Color,
        FontFamily,
        Placeholder.configure({
          placeholder: "Commencez à écrire votre chef-d'œuvre... ✨",
        }),
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-invert focus:outline-none max-w-none min-h-[500px]',
          spellcheck: 'false',
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.postForm.patchValue({ content: html }, { emitEvent: false });
      },
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  // Méthodes pour les statistiques
  getWordCount(): number {
    if (!this.editor) return 0;
    const text = this.editor.state.doc.textContent;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  getCharCount(): number {
    if (!this.editor) return 0;
    return this.editor.state.doc.textContent.length;
  }

  getReadTime(): number {
    const wordsPerMinute = 200;
    const words = this.getWordCount();
    return Math.ceil(words / wordsPerMinute) || 1;
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      const formValue = this.postForm.value;

      // ✅ Créer un objet typé CreatePostRequest
      const postData: CreatePostRequest = {
        title: formValue.title,
        excerpt: formValue.excerpt,
        content: formValue.content,
        image: formValue.image,
        category: formValue.category,
        tags: [], // Vous pouvez ajouter un champ tags dans le formulaire si nécessaire
      };

      // ✅ Appel au service avec le bon type
      this.blogService.addPost(postData).subscribe({
        next: (post: Post) => {
          console.log('✅ Post créé avec succès:', post);
          localStorage.removeItem('postDraft');
          this.router.navigate(['/blogger']);
        },
        error: (err) => {
          console.error('❌ Erreur lors de la création du post:', err);

          // Affichage d'erreur plus détaillé
          if (err.status === 401) {
            alert('Session expirée. Veuillez vous reconnecter.');
            this.router.navigate(['/login']);
          } else if (err.status === 403) {
            alert("Vous n'avez pas les permissions nécessaires.");
          } else {
            alert('Erreur lors de la publication du post. Vérifiez votre connexion.');
          }
        },
      });
    } else {
      this.postForm.markAllAsTouched();

      // Afficher les erreurs de validation
      Object.keys(this.postForm.controls).forEach((key) => {
        const control = this.postForm.get(key);
        if (control?.invalid) {
          console.log(`❌ Champ invalide: ${key}`, control.errors);
        }
      });
    }
  }
  saveDraft(): void {
    if (this.postForm.value.title || this.postForm.value.content) {
      localStorage.setItem('postDraft', JSON.stringify(this.postForm.value));
      console.log('💾 Brouillon sauvegardé!');
      // Vous pouvez ajouter un toast/notification ici
    }
  }

  onCancel(): void {
    // Demander confirmation si le formulaire a du contenu
    if (this.postForm.value.title || this.postForm.value.content) {
      if (confirm('Voulez-vous sauvegarder en brouillon avant de quitter?')) {
        this.saveDraft();
      }
    }
    this.router.navigate(['/']);
  }
}
