namespace Domain.Constants
{
    public static class RoleConstants
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string User = "User";

        public static IReadOnlyList<string> AllRoles => new[] { SuperAdmin, User };
    }
}
