/**
 * Blogger Related Posts Library Pro
 * A production-ready, configurable jQuery library with lazy loading and professional design
 *
 * @version 2.0.0
 * @author v0
 * @requires jQuery
 */

;(($) => {
  // Default configuration
  const defaults = {
    // Basic settings
    maxPosts: 6,
    showThumbnail: true,
    showDate: true,
    showSummary: true,
    summaryLength: 120,
    showAuthor: false,
    showReadTime: true,
    showLabels: true,
    maxLabels: 3,

    // Thumbnail settings
    thumbnailSize: 300,
    thumbnailQuality: "high", // 'low', 'medium', 'high'
    defaultThumbnail:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23adb5bd' font-family='system-ui' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E",

    // Layout options
    layout: "grid", // 'list', 'grid', 'masonry', 'carousel'
    columns: "auto", // 'auto', 1, 2, 3, 4
    cardStyle: "modern", // 'classic', 'modern', 'minimal', 'magazine'

    // Lazy loading
    lazyLoading: true,
    lazyLoadOffset: 100,
    loadingAnimation: true,
    skeletonLoading: true,

    // Animation settings
    fadeIn: true,
    fadeInDuration: 600,
    staggerDelay: 100,
    hoverEffects: true,

    // Date format
    dateFormat: "MMM dd, yyyy",
    relativeDate: true,

    // CSS classes
    containerClass: "brp-container",
    itemClass: "brp-item",
    thumbnailClass: "brp-thumbnail",
    titleClass: "brp-title",
    dateClass: "brp-date",
    summaryClass: "brp-summary",
    authorClass: "brp-author",
    labelsClass: "brp-labels",
    readTimeClass: "brp-read-time",

    // Filtering
    excludeCurrentPost: true,
    filterByLabels: true,
    shufflePosts: true,

    // Performance
    cacheResults: true,
    cacheDuration: 300000, // 5 minutes
    debounceResize: 250,

    // Accessibility
    ariaLabels: true,
    focusManagement: true,

    // Custom callbacks
    onLoad: null,
    onError: null,
    beforeRender: null,
    afterRender: null,
    onImageLoad: null,
    onImageError: null,
  }

  // Cache for storing results
  const cache = new Map()

  // Intersection Observer for lazy loading
  let lazyLoadObserver = null

  // Main plugin function
  $.fn.bloggerRelatedPostsPro = function (options) {
    const settings = $.extend({}, defaults, options)

    return this.each(function () {
      const $container = $(this)
      const relatedPosts = new BloggerRelatedPostsPro($container, settings)
      relatedPosts.init()
    })
  }

  // BloggerRelatedPostsPro class
  function BloggerRelatedPostsPro($container, settings) {
    this.$container = $container
    this.settings = settings
    this.blogUrl = this.getBlogUrl()
    this.currentPostUrl = window.location.href
    this.currentPostLabels = this.getCurrentPostLabels()
    this.isLoading = false
    this.posts = []
    this.cacheKey = this.generateCacheKey()
  }

  BloggerRelatedPostsPro.prototype = {
    init: function () {
      this.setupLazyLoading()
      this.setupResizeHandler()
      this.loadRelatedPosts()
    },

    setupLazyLoading: function () {
      if (!this.settings.lazyLoading || !window.IntersectionObserver) return

      lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const $img = $(entry.target)
              const src = $img.data("src")

              if (src) {
                $img.attr("src", src)
                $img.removeClass("brp-lazy")
                $img.addClass("brp-loading")

                $img
                  .on("load", () => {
                    $img.removeClass("brp-loading").addClass("brp-loaded")
                    if (this.settings.onImageLoad) {
                      this.settings.onImageLoad.call(this, $img[0])
                    }
                  })
                  .on("error", () => {
                    $img.attr("src", this.settings.defaultThumbnail)
                    $img.removeClass("brp-loading").addClass("brp-error")
                    if (this.settings.onImageError) {
                      this.settings.onImageError.call(this, $img[0])
                    }
                  })

                lazyLoadObserver.unobserve(entry.target)
              }
            }
          })
        },
        {
          rootMargin: `${this.settings.lazyLoadOffset}px`,
          threshold: 0.1,
        },
      )
    },

    setupResizeHandler: function () {
      let resizeTimer
      $(window).on("resize.brp", () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          this.handleResize()
        }, this.settings.debounceResize)
      })
    },

    handleResize: function () {
      if (this.settings.layout === "masonry") {
        this.initMasonry()
      }
    },

    getBlogUrl: () => {
      const url = window.location.href
      const match = url.match(/(https?:\/\/[^/]+)/)
      return match ? match[1] : ""
    },

    getCurrentPostLabels: () => {
      const labels = []

      // Check for labels in meta tags
      $('meta[name="keywords"]').each(function () {
        const content = $(this).attr("content")
        if (content) {
          labels.push(...content.split(",").map((label) => label.trim()))
        }
      })

      // Check for Blogger's global post labels variable
      if (typeof postLabels !== "undefined" && typeof window.postLabels !== "undefined" && window.postLabels) {
        labels.push(...window.postLabels)
      }

      // Check for schema.org keywords
      $('meta[property="article:tag"]').each(function () {
        const content = $(this).attr("content")
        if (content) labels.push(content.trim())
      })

      return [...new Set(labels)] // Remove duplicates
    },

    generateCacheKey: function () {
      const key = `brp_${this.blogUrl}_${this.currentPostLabels.join("_")}_${this.settings.maxPosts}`
      return btoa(key)
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 32)
    },

    loadRelatedPosts: function () {
      if (this.isLoading) return
      this.isLoading = true

      // Show loading state
      this.showLoadingState()

      // Check cache first
      if (this.settings.cacheResults && this.checkCache()) {
        return
      }

      const feedUrl = this.buildFeedUrl()

      $.ajax({
        url: feedUrl,
        type: "GET",
        dataType: "jsonp",
        timeout: 10000,
        success: (data) => {
          this.handleSuccess(data)
        },
        error: (xhr, status, error) => {
          this.handleError(error)
        },
        complete: () => {
          this.isLoading = false
        },
      })
    },

    checkCache: function () {
      const cached = cache.get(this.cacheKey)
      if (cached && Date.now() - cached.timestamp < this.settings.cacheDuration) {
        setTimeout(() => {
          this.handleSuccess(cached.data)
        }, 100)
        return true
      }
      return false
    },

    buildFeedUrl: function () {
      let feedUrl = `${this.blogUrl}/feeds/posts/default?alt=json-in-script&max-results=50`

      // Add label filtering if enabled and labels exist
      if (this.settings.filterByLabels && this.currentPostLabels.length > 0) {
        const labelQuery = this.currentPostLabels[0]
        feedUrl += `&category=${encodeURIComponent(labelQuery)}`
      }

      return feedUrl
    },

    showLoadingState: function () {
      if (!this.settings.skeletonLoading) {
        this.$container.html(
          '<div class="brp-loading-spinner"><div class="brp-spinner"></div><p>Loading related posts...</p></div>',
        )
        return
      }

      const skeletonCount = Math.min(this.settings.maxPosts, 6)
      let skeletonHTML = `<div class="brp-container brp-skeleton-container ${this.settings.layout}">`

      for (let i = 0; i < skeletonCount; i++) {
        skeletonHTML += this.createSkeletonItem()
      }

      skeletonHTML += "</div>"
      this.$container.html(skeletonHTML)
    },

    createSkeletonItem: function () {
      return `
        <div class="brp-item brp-skeleton-item">
          ${this.settings.showThumbnail ? '<div class="brp-thumbnail brp-skeleton-thumbnail"></div>' : ""}
          <div class="brp-content">
            <div class="brp-skeleton-title"></div>
            <div class="brp-skeleton-title brp-skeleton-title-short"></div>
            ${this.settings.showDate ? '<div class="brp-skeleton-date"></div>' : ""}
            ${
              this.settings.showSummary
                ? `
              <div class="brp-skeleton-summary"></div>
              <div class="brp-skeleton-summary"></div>
              <div class="brp-skeleton-summary brp-skeleton-summary-short"></div>
            `
                : ""
            }
            ${this.settings.showLabels ? '<div class="brp-skeleton-labels"></div>' : ""}
          </div>
        </div>
      `
    },

    handleSuccess: function (data) {
      if (this.settings.onLoad) {
        this.settings.onLoad.call(this, data)
      }

      // Cache the results
      if (this.settings.cacheResults) {
        cache.set(this.cacheKey, {
          data: data,
          timestamp: Date.now(),
        })
      }

      this.posts = this.processPosts(data)
      this.renderPosts(this.posts)
    },

    handleError: function (error) {
      console.error("Blogger Related Posts Pro Error:", error)

      if (this.settings.onError) {
        this.settings.onError.call(this, error)
      } else {
        this.$container.html(`
          <div class="brp-error">
            <div class="brp-error-icon">⚠️</div>
            <h3>Unable to Load Related Posts</h3>
            <p>Please check your internet connection and try again.</p>
            <button class="brp-retry-btn" onclick="location.reload()">Retry</button>
          </div>
        `)
      }
    },

    processPosts: function (data) {
      let posts = []

      if (data.feed && data.feed.entry) {
        posts = data.feed.entry.map((entry) => this.parsePost(entry))

        // Filter out current post if enabled
        if (this.settings.excludeCurrentPost) {
          posts = posts.filter((post) => !this.isCurrentPost(post.url))
        }

        // Shuffle posts for variety
        if (this.settings.shufflePosts) {
          posts = this.shuffleArray(posts)
        }

        // Limit to max posts
        posts = posts.slice(0, this.settings.maxPosts)
      }

      return posts
    },

    parsePost: function (entry) {
      const post = {
        title: entry.title.$t,
        url: this.getPostUrl(entry.link),
        summary: this.getPostSummary(entry),
        thumbnail: this.getPostThumbnail(entry),
        date: new Date(entry.published.$t),
        updated: entry.updated ? new Date(entry.updated.$t) : null,
        author: entry.author ? entry.author[0].name.$t : "",
        labels: this.getPostLabels(entry),
        readTime: this.calculateReadTime(entry),
        id: this.getPostId(entry),
      }

      return post
    },

    getPostUrl: (links) => {
      for (let i = 0; i < links.length; i++) {
        if (links[i].rel === "alternate") {
          return links[i].href
        }
      }
      return "#"
    },

    getPostId: (entry) => {
      if (entry.id && entry.id.$t) {
        const match = entry.id.$t.match(/post-(\d+)/)
        return match ? match[1] : Date.now().toString()
      }
      return Date.now().toString()
    },

    isCurrentPost: (postUrl) => {
      const currentPath = window.location.pathname
      const postPath = new URL(postUrl).pathname
      return currentPath === postPath
    },

    getPostSummary: function (entry) {
      let summary = ""

      if (entry.summary) {
        summary = entry.summary.$t
      } else if (entry.content) {
        summary = entry.content.$t
      }

      // Strip HTML tags and decode entities
      summary = summary.replace(/<[^>]*>/g, "")
      summary = this.decodeHtmlEntities(summary)

      // Truncate to specified length
      if (summary.length > this.settings.summaryLength) {
        summary = summary.substring(0, this.settings.summaryLength).trim()
        // Don't cut words in half
        const lastSpace = summary.lastIndexOf(" ")
        if (lastSpace > this.settings.summaryLength * 0.8) {
          summary = summary.substring(0, lastSpace)
        }
        summary += "..."
      }

      return summary
    },

    decodeHtmlEntities: (text) => {
      const textarea = document.createElement("textarea")
      textarea.innerHTML = text
      return textarea.value
    },

    getPostThumbnail: function (entry) {
      let thumbnail = this.settings.defaultThumbnail

      // Try to get thumbnail from media
      if (entry.media$thumbnail) {
        thumbnail = entry.media$thumbnail.url
        thumbnail = this.optimizeThumbnail(thumbnail)
      } else if (entry.content && entry.content.$t) {
        // Try to extract first image from content
        const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/i)
        if (imgMatch) {
          thumbnail = this.optimizeThumbnail(imgMatch[1])
        }
      }

      return thumbnail
    },

    optimizeThumbnail: function (url) {
      if (!url || url === this.settings.defaultThumbnail) return url

      // Optimize Blogger/Google images
      if (url.includes("blogspot.com") || url.includes("googleusercontent.com")) {
        // Remove existing size parameters
        url = url.replace(/\/s\d+-c/, "").replace(/=s\d+-c/, "")

        // Add optimized size based on quality setting
        const sizes = {
          low: 150,
          medium: 300,
          high: 600,
        }
        const size = sizes[this.settings.thumbnailQuality] || sizes.medium

        if (url.includes("=")) {
          url += `-c=s${size}`
        } else {
          url += `=s${size}-c`
        }
      }

      return url
    },

    getPostLabels: (entry) => {
      const labels = []
      if (entry.category) {
        entry.category.forEach((cat) => {
          labels.push(cat.term)
        })
      }
      return labels
    },

    calculateReadTime: (entry) => {
      let content = ""
      if (entry.content) {
        content = entry.content.$t
      } else if (entry.summary) {
        content = entry.summary.$t
      }

      // Strip HTML and count words
      const text = content.replace(/<[^>]*>/g, "")
      const wordCount = text.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200) // Average reading speed

      return readTime
    },

    shuffleArray: (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },

    renderPosts: function (posts) {
      if (this.settings.beforeRender) {
        this.settings.beforeRender.call(this, posts)
      }

      const $container = this.createContainer()

      if (posts.length === 0) {
        $container.html(this.createEmptyState())
      } else {
        posts.forEach((post, index) => {
          const $postItem = this.createPostItem(post, index)
          $container.append($postItem)
        })
      }

      // Clear container and add new content
      this.$container.empty().append($container)

      // Initialize layout-specific features
      this.initializeLayout()

      // Apply animations
      this.applyAnimations()

      // Setup lazy loading for images
      this.setupImageLazyLoading()

      if (this.settings.afterRender) {
        this.settings.afterRender.call(this, posts)
      }
    },

    createContainer: function () {
      const columns = this.getColumnCount()
      const $container = $("<div>")
        .addClass(this.settings.containerClass)
        .addClass(`brp-layout-${this.settings.layout}`)
        .addClass(`brp-style-${this.settings.cardStyle}`)
        .addClass(`brp-cols-${columns}`)

      if (this.settings.hoverEffects) {
        $container.addClass("brp-hover-effects")
      }

      return $container
    },

    getColumnCount: function () {
      if (this.settings.columns === "auto") {
        const width = $(window).width()
        if (width < 576) return 1
        if (width < 768) return 2
        if (width < 992) return 3
        return 3
      }
      return this.settings.columns
    },

    createEmptyState: () => `
        <div class="brp-empty-state">
          <div class="brp-empty-icon">📝</div>
          <h3>No Related Posts Found</h3>
          <p>Check back later for more content!</p>
        </div>
      `,

    createPostItem: function (post, index) {
      const $item = $("<article>")
        .addClass(this.settings.itemClass)
        .attr("data-post-id", post.id)
        .css("animation-delay", `${index * this.settings.staggerDelay}ms`)

      if (this.settings.ariaLabels) {
        $item.attr("aria-label", `Related post: ${post.title}`)
      }

      // Thumbnail
      if (this.settings.showThumbnail) {
        const $thumbnail = this.createThumbnail(post)
        $item.append($thumbnail)
      }

      // Content wrapper
      const $content = $("<div>").addClass("brp-content")

      // Labels (at top for magazine style)
      if (this.settings.showLabels && post.labels.length > 0 && this.settings.cardStyle === "magazine") {
        const $labels = this.createLabels(post.labels)
        $content.append($labels)
      }

      // Title
      const $title = this.createTitle(post)
      $content.append($title)

      // Meta information
      const $meta = this.createMeta(post)
      if ($meta.children().length > 0) {
        $content.append($meta)
      }

      // Summary
      if (this.settings.showSummary && post.summary) {
        const $summary = this.createSummary(post)
        $content.append($summary)
      }

      // Labels (at bottom for other styles)
      if (this.settings.showLabels && post.labels.length > 0 && this.settings.cardStyle !== "magazine") {
        const $labels = this.createLabels(post.labels)
        $content.append($labels)
      }

      $item.append($content)
      return $item
    },

    createThumbnail: function (post) {
      const $thumbnail = $("<div>").addClass(this.settings.thumbnailClass)
      const $link = $("<a>").attr("href", post.url).attr("aria-label", `Read: ${post.title}`)

      const $img = $("<img>").attr("alt", post.title).attr("loading", "lazy")

      if (this.settings.lazyLoading && lazyLoadObserver) {
        $img
          .addClass("brp-lazy")
          .attr("data-src", post.thumbnail)
          .attr(
            "src",
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3C/svg%3E',
          )
      } else {
        $img.attr("src", post.thumbnail)
      }

      $link.append($img)
      $thumbnail.append($link)

      return $thumbnail
    },

    createTitle: function (post) {
      const $title = $("<h3>").addClass(this.settings.titleClass)
      const $titleLink = $("<a>").attr("href", post.url).text(post.title).attr("title", post.title)

      if (this.settings.focusManagement) {
        $titleLink.attr("tabindex", "0")
      }

      $title.append($titleLink)
      return $title
    },

    createMeta: function (post) {
      const $meta = $("<div>").addClass("brp-meta")

      // Date
      if (this.settings.showDate) {
        const $date = $("<time>")
          .addClass(this.settings.dateClass)
          .attr("datetime", post.date.toISOString())
          .text(this.formatDate(post.date))
        $meta.append($date)
      }

      // Author
      if (this.settings.showAuthor && post.author) {
        const $author = $("<span>").addClass(this.settings.authorClass)
        $author.html(`<span class="brp-author-label">By</span> ${post.author}`)
        $meta.append($author)
      }

      // Read time
      if (this.settings.showReadTime && post.readTime > 0) {
        const $readTime = $("<span>").addClass(this.settings.readTimeClass)
        $readTime.html(`<span class="brp-read-icon">📖</span> ${post.readTime} min read`)
        $meta.append($readTime)
      }

      return $meta
    },

    createSummary: function (post) {
      const $summary = $("<p>").addClass(this.settings.summaryClass)
      $summary.text(post.summary)
      return $summary
    },

    createLabels: function (labels) {
      const $labelsContainer = $("<div>").addClass(this.settings.labelsClass)
      const displayLabels = labels.slice(0, this.settings.maxLabels)

      displayLabels.forEach((label) => {
        const $label = $("<span>").addClass("brp-label").text(label)
        $labelsContainer.append($label)
      })

      if (labels.length > this.settings.maxLabels) {
        const remaining = labels.length - this.settings.maxLabels
        const $more = $("<span>").addClass("brp-label brp-label-more").text(`+${remaining}`)
        $labelsContainer.append($more)
      }

      return $labelsContainer
    },

    formatDate: function (date) {
      if (this.settings.relativeDate) {
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
      }

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()

      return `${month} ${day}, ${year}`
    },

    initializeLayout: function () {
      switch (this.settings.layout) {
        case "masonry":
          this.initMasonry()
          break
        case "carousel":
          this.initCarousel()
          break
      }
    },

    initMasonry: function () {
      // Simple masonry-like layout using CSS Grid
      const $container = this.$container.find(`.${this.settings.containerClass}`)
      $container.addClass("brp-masonry-initialized")
    },

    initCarousel: function () {
      const $container = this.$container.find(`.${this.settings.containerClass}`)
      $container.addClass("brp-carousel-initialized")

      // Add navigation buttons
      const $nav = $(`
        <div class="brp-carousel-nav">
          <button class="brp-carousel-btn brp-carousel-prev" aria-label="Previous posts">‹</button>
          <button class="brp-carousel-btn brp-carousel-next" aria-label="Next posts">›</button>
        </div>
      `)

      this.$container.append($nav)
      this.setupCarouselNavigation()
    },

    setupCarouselNavigation: function () {
      const $container = this.$container.find(`.${this.settings.containerClass}`)
      const $items = $container.find(`.${this.settings.itemClass}`)
      const $prev = this.$container.find(".brp-carousel-prev")
      const $next = this.$container.find(".brp-carousel-next")

      let currentIndex = 0
      const itemsPerView = this.getCarouselItemsPerView()
      const maxIndex = Math.max(0, $items.length - itemsPerView)

      const updateCarousel = () => {
        const translateX = -(currentIndex * (100 / itemsPerView))
        $container.css("transform", `translateX(${translateX}%)`)

        $prev.prop("disabled", currentIndex === 0)
        $next.prop("disabled", currentIndex >= maxIndex)
      }

      $prev.on("click", () => {
        if (currentIndex > 0) {
          currentIndex--
          updateCarousel()
        }
      })

      $next.on("click", () => {
        if (currentIndex < maxIndex) {
          currentIndex++
          updateCarousel()
        }
      })

      updateCarousel()
    },

    getCarouselItemsPerView: () => {
      const width = $(window).width()
      if (width < 576) return 1
      if (width < 768) return 2
      if (width < 992) return 3
      return 4
    },

    applyAnimations: function () {
      if (!this.settings.fadeIn) return

      const $items = this.$container.find(`.${this.settings.itemClass}`)

      $items.each((index, item) => {
        const $item = $(item)
        $item.addClass("brp-fade-in")

        setTimeout(() => {
          $item.addClass("brp-fade-in-active")
        }, index * this.settings.staggerDelay)
      })
    },

    setupImageLazyLoading: function () {
      if (!this.settings.lazyLoading || !lazyLoadObserver) return

      const $lazyImages = this.$container.find("img.brp-lazy")
      $lazyImages.each((index, img) => {
        lazyLoadObserver.observe(img)
      })
    },

    destroy: function () {
      // Clean up event listeners
      $(window).off("resize.brp")

      // Disconnect lazy load observer
      if (lazyLoadObserver) {
        lazyLoadObserver.disconnect()
      }

      // Clear cache
      cache.clear()

      // Remove container content
      this.$container.empty()
    },
  }

  // Static method to initialize with default settings
  $.bloggerRelatedPostsPro = (selector, options) => {
    jQuery(selector).bloggerRelatedPostsPro(options)
  }

  // Utility method to clear cache
  $.bloggerRelatedPostsPro.clearCache = () => {
    cache.clear()
  }
})(jQuery)
