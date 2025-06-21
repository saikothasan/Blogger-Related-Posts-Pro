/**
 * Blogger Related Posts - Simple Configuration Version
 * Easy setup with just URL and post count
 *
 * @version 2.1.0
 * @author v0
 * @requires jQuery
 */

;(($) => {
  // Simple configuration defaults
  const defaults = {
    // Required: Blogger URL
    blogUrl: "", // e.g., "https://yourblog.blogspot.com"

    // Basic settings
    maxPosts: 6,
    showThumbnail: true,
    showDate: true,
    showSummary: true,
    summaryLength: 120,

    // Feed settings
    feedPath: "/feeds/posts/default", // Default Blogger feed path
    feedParams: {
      alt: "json-in-script",
      "max-results": 50, // Fetch more to have variety for filtering
    },

    // Auto-detect current blog URL if not provided
    autoDetectBlogUrl: true,

    // Layout
    layout: "grid", // 'grid', 'list'
    cardStyle: "modern",

    // Performance
    lazyLoading: true,
    cacheResults: true,
    cacheDuration: 300000, // 5 minutes

    // Styling
    fadeIn: true,
    hoverEffects: true,

    // Callbacks
    onLoad: null,
    onError: null,
    onConfigError: null,
  }

  // Main plugin function
  $.fn.bloggerRelatedPosts = function (options) {
    // Validate and process configuration
    const config = $.extend({}, defaults, options)

    // Validate configuration
    if (!validateConfig(config)) {
      return this
    }

    return this.each(function () {
      const $container = $(this)
      const relatedPosts = new BloggerRelatedPosts($container, config)
      relatedPosts.init()
    })
  }

  // Configuration validation
  function validateConfig(config) {
    // Auto-detect blog URL if not provided
    if (!config.blogUrl && config.autoDetectBlogUrl) {
      config.blogUrl = detectBlogUrl()
    }

    // Validate blog URL
    if (!config.blogUrl) {
      console.error("Blogger Related Posts: blogUrl is required")
      if (config.onConfigError) {
        config.onConfigError("Missing blogUrl configuration")
      }
      return false
    }

    // Ensure URL format is correct
    if (!isValidUrl(config.blogUrl)) {
      console.error("Blogger Related Posts: Invalid blogUrl format")
      if (config.onConfigError) {
        config.onConfigError("Invalid blogUrl format")
      }
      return false
    }

    // Normalize blog URL (remove trailing slash)
    config.blogUrl = config.blogUrl.replace(/\/$/, "")

    // Validate maxPosts
    if (config.maxPosts < 1 || config.maxPosts > 50) {
      console.warn("Blogger Related Posts: maxPosts should be between 1 and 50, using default value")
      config.maxPosts = defaults.maxPosts
    }

    return true
  }

  // Auto-detect blog URL from current page
  function detectBlogUrl() {
    const currentUrl = window.location.href

    // Check if we're on a Blogger domain
    if (currentUrl.includes(".blogspot.com")) {
      const match = currentUrl.match(/(https?:\/\/[^/]+\.blogspot\.com)/)
      return match ? match[1] : null
    }

    // Check for custom domain with Blogger
    const metaGenerator = $('meta[name="generator"]').attr("content")
    if (metaGenerator && metaGenerator.toLowerCase().includes("blogger")) {
      const match = currentUrl.match(/(https?:\/\/[^/]+)/)
      return match ? match[1] : null
    }

    return null
  }

  // Validate URL format
  function isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Cache for storing results
  const cache = new Map()

  // BloggerRelatedPosts class
  function BloggerRelatedPosts($container, config) {
    this.$container = $container
    this.config = config
    this.currentPostUrl = window.location.href
    this.currentPostLabels = this.getCurrentPostLabels()
    this.isLoading = false
    this.posts = []
    this.cacheKey = this.generateCacheKey()
  }

  BloggerRelatedPosts.prototype = {
    init: function () {
      this.showLoadingState()
      this.loadRelatedPosts()
    },

    generateCacheKey: function () {
      const key = `brp_${this.config.blogUrl}_${this.config.maxPosts}_${this.currentPostLabels.join("_")}`
      return btoa(key)
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 32)
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
      if (typeof window.postLabels !== "undefined" && window.postLabels) {
        labels.push(...window.postLabels)
      }

      return [...new Set(labels)] // Remove duplicates
    },

    buildFeedUrl: function () {
      const params = new URLSearchParams(this.config.feedParams)

      // Add label filtering if we have labels
      if (this.currentPostLabels.length > 0) {
        params.set("category", this.currentPostLabels[0])
      }

      return `${this.config.blogUrl}${this.config.feedPath}?${params.toString()}`
    },

    loadRelatedPosts: function () {
      if (this.isLoading) return
      this.isLoading = true

      // Check cache first
      if (this.config.cacheResults && this.checkCache()) {
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
      if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
        setTimeout(() => {
          this.handleSuccess(cached.data)
        }, 100)
        return true
      }
      return false
    },

    showLoadingState: function () {
      this.$container.html(`
        <div class="brp-loading">
          <div class="brp-spinner"></div>
          <p>Loading related posts...</p>
        </div>
      `)
    },

    handleSuccess: function (data) {
      if (this.config.onLoad) {
        this.config.onLoad.call(this, data)
      }

      // Cache the results
      if (this.config.cacheResults) {
        cache.set(this.cacheKey, {
          data: data,
          timestamp: Date.now(),
        })
      }

      this.posts = this.processPosts(data)
      this.renderPosts(this.posts)
    },

    handleError: function (error) {
      console.error("Blogger Related Posts Error:", error)

      if (this.config.onError) {
        this.config.onError.call(this, error)
      } else {
        this.$container.html(`
          <div class="brp-error">
            <h3>Unable to Load Related Posts</h3>
            <p>Please check your blog URL configuration.</p>
            <p><strong>Current URL:</strong> ${this.config.blogUrl}</p>
            <button class="brp-retry-btn" onclick="location.reload()">Retry</button>
          </div>
        `)
      }
    },

    processPosts: function (data) {
      let posts = []

      if (data.feed && data.feed.entry) {
        posts = data.feed.entry.map((entry) => this.parsePost(entry))

        // Filter out current post
        posts = posts.filter((post) => !this.isCurrentPost(post.url))

        // Shuffle for variety
        posts = this.shuffleArray(posts)

        // Limit to max posts
        posts = posts.slice(0, this.config.maxPosts)
      }

      return posts
    },

    parsePost: function (entry) {
      return {
        title: entry.title.$t,
        url: this.getPostUrl(entry.link),
        summary: this.getPostSummary(entry),
        thumbnail: this.getPostThumbnail(entry),
        date: new Date(entry.published.$t),
        author: entry.author ? entry.author[0].name.$t : "",
        labels: this.getPostLabels(entry),
        id: this.getPostId(entry),
      }
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

      // Strip HTML tags
      summary = summary.replace(/<[^>]*>/g, "")

      // Truncate to specified length
      if (summary.length > this.config.summaryLength) {
        summary = summary.substring(0, this.config.summaryLength).trim()
        const lastSpace = summary.lastIndexOf(" ")
        if (lastSpace > this.config.summaryLength * 0.8) {
          summary = summary.substring(0, lastSpace)
        }
        summary += "..."
      }

      return summary
    },

    getPostThumbnail: (entry) => {
      let thumbnail = "/placeholder.svg?height=200&width=300"

      if (entry.media$thumbnail) {
        thumbnail = entry.media$thumbnail.url
        // Optimize thumbnail size
        thumbnail = thumbnail.replace(/\/s\d+-c/, "").replace(/=s\d+-c/, "") + "=s300-c"
      } else if (entry.content && entry.content.$t) {
        const imgMatch = entry.content.$t.match(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/i)
        if (imgMatch) {
          thumbnail = imgMatch[1]
        }
      }

      return thumbnail
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

    shuffleArray: (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },

    renderPosts: function (posts) {
      const $container = $("<div>").addClass(
        `brp-container brp-layout-${this.config.layout} brp-style-${this.config.cardStyle}`,
      )

      if (posts.length === 0) {
        $container.html(`
          <div class="brp-empty">
            <h3>No Related Posts Found</h3>
            <p>Try browsing other posts on the blog.</p>
          </div>
        `)
      } else {
        posts.forEach((post, index) => {
          const $postItem = this.createPostItem(post, index)
          $container.append($postItem)
        })
      }

      this.$container.empty().append($container)

      if (this.config.fadeIn) {
        $container.hide().fadeIn(600)
      }
    },

    createPostItem: function (post, index) {
      const $item = $("<article>").addClass("brp-item")

      // Thumbnail
      if (this.config.showThumbnail) {
        const $thumbnail = $("<div>").addClass("brp-thumbnail")
        const $link = $("<a>").attr("href", post.url)
        const $img = $("<img>").attr("alt", post.title).attr("loading", "lazy")

        if (this.config.lazyLoading) {
          $img
            .attr("data-src", post.thumbnail)
            .attr(
              "src",
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3C/svg%3E',
            )
            .addClass("brp-lazy")
        } else {
          $img.attr("src", post.thumbnail)
        }

        $link.append($img)
        $thumbnail.append($link)
        $item.append($thumbnail)
      }

      // Content
      const $content = $("<div>").addClass("brp-content")

      // Title
      const $title = $("<h3>").addClass("brp-title")
      const $titleLink = $("<a>").attr("href", post.url).text(post.title)
      $title.append($titleLink)
      $content.append($title)

      // Date
      if (this.config.showDate) {
        const $date = $("<time>").addClass("brp-date").text(this.formatDate(post.date))
        $content.append($date)
      }

      // Summary
      if (this.config.showSummary && post.summary) {
        const $summary = $("<p>").addClass("brp-summary").text(post.summary)
        $content.append($summary)
      }

      $item.append($content)

      // Setup lazy loading
      if (this.config.lazyLoading) {
        this.setupLazyLoading($item.find("img.brp-lazy"))
      }

      return $item
    },

    setupLazyLoading: ($images) => {
      if (!window.IntersectionObserver) {
        // Fallback for older browsers
        $images.each(function () {
          const $img = $(this)
          $img.attr("src", $img.data("src"))
        })
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const $img = $(entry.target)
              const src = $img.data("src")

              if (src) {
                $img.attr("src", src)
                $img.removeClass("brp-lazy")
                observer.unobserve(entry.target)
              }
            }
          })
        },
        {
          rootMargin: "50px",
        },
      )

      $images.each(function () {
        observer.observe(this)
      })
    },

    formatDate: (date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      const day = date.getDate()
      const month = months[date.getMonth()]
      const year = date.getFullYear()

      return `${month} ${day}, ${year}`
    },
  }

  // Static method for easy initialization
  $.bloggerRelatedPosts = (selector, options) => {
    $(selector).bloggerRelatedPosts(options)
  }

  // Utility method to clear cache
  $.bloggerRelatedPosts.clearCache = () => {
    cache.clear()
  }
})(jQuery)
