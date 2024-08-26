document.addEventListener("alpine:init", () => {
  // Accordion Component
  Alpine.data("about_accordion", () => ({
    isOpen: false,

    toggle() {
      this.isOpen = !this.isOpen;
    },
  }));

  // Doc and data sources page
  Alpine.data("docData", () => ({
    docs: [],
    programs: [],
    topics: [],
    documentTypes: [],
    informationTypes: [],
    filters: {
      programs: [],
      topics: [],
      documentTypes: [],
      informationTypes: [],
      startDate: "",
      endDate: "",
    },
    currentPage: 1,
    itemsPerPage: 5,

    get filteredDocs() {
      let filtered = this.docs
        .filter((doc) => {
          return (
            (this.filters.programs.length === 0 ||
              this.filters.programs.includes(doc.program_name)) &&
            (this.filters.topics.length === 0 ||
              this.filters.topics.includes(doc.topic_area)) &&
            (this.filters.documentTypes.length === 0 ||
              this.filters.documentTypes.includes(doc.file_type)) &&
            (this.filters.informationTypes.length === 0 ||
              this.filters.informationTypes.includes(doc.information_type)) &&
            (this.filters.startDate === "" ||
              new Date(doc.publish_date) >= new Date(this.filters.startDate)) &&
            (this.filters.endDate === "" ||
              new Date(doc.publish_date) <= new Date(this.filters.endDate))
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.publish_date);
          const dateB = new Date(b.publish_date);

          if (dateA > dateB) return -1;
          if (dateA < dateB) return 1;

          return a.program_name.localeCompare(b.program_name);
        });

      return filtered.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    },

    get totalPages() {
      return Math.ceil(this.docs.length / this.itemsPerPage);
    },

    pagesToShow() {
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;
      const pages = [];

      if (totalPages <= 5) {
        // Show all pages if total pages are 5 or less
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          // Show first 4 pages and the last page
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage > 3 && currentPage < totalPages - 2) {
          // Show current page, 2 before, 2 after, and the last page
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else {
          // Show first page, ellipsis, and last 4 pages
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        }
      }

      return pages;
    },

    init() {
      fetch("/assets/js/arp/docs-and-data-sources.json")
        .then((response) => response.json())
        .then((data) => {
          this.docs = data;
          this.programs = [...new Set(data.map((doc) => doc.program_name))];
          this.topics = [...new Set(data.map((doc) => doc.topic_area))];
          this.documentTypes = [...new Set(data.map((doc) => doc.file_type))];
          this.informationTypes = [
            ...new Set(data.map((doc) => doc.information_type)),
          ];
        });
    },

    resetFilters() {
      this.filters.programs = [];
      this.filters.topics = [];
      this.filters.documentTypes = [];
      this.filters.informationTypes = [];
      this.filters.startDate = "";
      this.filters.endDate = "";
      this.currentPage = 1; // Reset to first page when filters are reset
    },

    goToPage(pageNumber) {
      if (pageNumber === "...") return;
      this.currentPage = pageNumber;
    },
  }));
});
