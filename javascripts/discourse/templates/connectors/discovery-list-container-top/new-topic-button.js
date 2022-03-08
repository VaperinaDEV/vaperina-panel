import { apiInitializer } from "discourse/lib/api";
import discourseComputed from "discourse-common/utils/decorators";

export default apiInitializer("0.8", (api) => {
  api.registerConnectorClass("discovery-list-container-top", "vaperina-panel", {
    
    @discourseComputed("category")
    showCategoryNotifications(category) {
      return category && this.currentUser;
    },
    @discourseComputed("hasDraft")
    createTopicLabel(hasDraft) {
      return hasDraft ? "topic.open_draft" : "topic.create";
    },
    actions: {
      clickCreateTopicButton() {
        if (this.categoryReadOnlyBanner && !this.hasDraft) {
          bootbox.alert(this.categoryReadOnlyBanner);
        } else {
          this.createTopic();
        }
      },
    },
  });
});
