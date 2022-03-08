import { apiInitializer } from "discourse/lib/api";
import discourseComputed from "discourse-common/utils/decorators";

export default apiInitializer("0.8", (api) => {
  api.modifyClass("component:d-navigation", {
     pluginId: "category-btn-name",
    
    @discourseComputed("category")
    showCategoryNotifications(category) {
      return category && this.currentUser;
    },
    @discourseComputed("hasDraft")
    createTopicLabel(hasDraft) {
      return hasDraft ? "topic.open_draft" : "topic.create";
    },
    actions: {
      this._super(clickCreateTopicButton);
    },
  });
});
