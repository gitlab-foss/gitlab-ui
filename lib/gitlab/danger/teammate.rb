# frozen_string_literal: true

require 'cgi'

module Gitlab
  module Danger
    class Teammate
      attr_reader :name, :username, :role, :projects

      def initialize(options = {})
        @username = options['username']
        @name = options['name'] || @username
        @role = options['role']
        @projects = options['projects']
      end

      def markdown_name
        "[#{name}](https://gitlab.com/#{username}) (`@#{username}`)"
      end

      def in_project?(name)
        projects&.has_key?(name)
      end

      # Traintainers also count as reviewers
      def reviewer?(project, category)
        has_capability?(project, category, :reviewer) ||
          traintainer?(project, category)
      end

      def traintainer?(project, category)
        has_capability?(project, category, :trainee_maintainer)
      end

      def maintainer?(project, category)
        has_capability?(project, category, :maintainer)
      end

      def status
        api_endpoint = "https://gitlab.com/api/v4/users/#{CGI.escape(username)}/status"
        @status ||= Gitlab::Danger::RequestHelper.http_get_json(api_endpoint)
      rescue Gitlab::Danger::RequestHelper::HTTPError, JSON::ParserError
        nil # better no status than a crashing Danger
      end

      # @return [Boolean]
      def available?
        !out_of_office? && has_capacity?
      end

      private

      # @return [Boolean]
      def out_of_office?
        status&.dig("message")&.match?(/OOO/i) || false
      end

      # @return [Boolean]
      def has_capacity?
        status&.dig("emoji") != 'red_circle'
      end

      def has_capability?(project, category, kind)
        capabilities(project).include?("#{kind} #{category}")
      end

      def capabilities(project)
        Array(projects.fetch(project, []))
      end
    end
  end
end
